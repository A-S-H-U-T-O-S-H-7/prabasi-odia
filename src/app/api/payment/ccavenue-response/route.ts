import { NextResponse } from 'next/server';
import { donationService } from '@/lib/services/donationService';
import {
  amountsMatch,
  buildFailedRedirect,
  buildSuccessRedirect,
  decryptCCAvenueResponse,
  extractEncResp,
  getRequestBaseUrl,
  mapOrderStatus,
} from '@/lib/payment/ccavenue';

async function handlePaymentResponse(request: Request) {
  const baseUrl = getRequestBaseUrl(request);

  try {
    const encResp = await extractEncResp(request);

    if (!encResp) {
      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, { message: 'Missing encrypted payment response' }),
        303
      );
    }

    const decrypted = await decryptCCAvenueResponse(encResp);

    if (!decrypted.ok || !decrypted.data?.order_id) {
      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, {
          message: decrypted.error || 'Unable to verify payment response',
        }),
        303
      );
    }

    const data = decrypted.data;
    const orderId = String(data.order_id);
    const status = mapOrderStatus(data.order_status);

    const donationResult = await donationService.getDonation(orderId);
    if (!donationResult.success || !donationResult.data) {
      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, {
          order_id: orderId,
          message: 'Donation record not found',
          status_message: data.order_status,
          failure_message: data.failure_message,
        }),
        303
      );
    }

    const donation = donationResult.data;

    if (status === 'completed' && !amountsMatch(donation.amount, data.amount)) {
      await donationService.updateDonationStatus(orderId, 'failed', {
        ...data,
        transaction_id: data.tracking_id || data.bank_ref_no,
        failure_message: 'Amount mismatch',
      });

      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, {
          order_id: orderId,
          message: 'Payment amount mismatch',
          amount: data.amount,
          status_message: data.order_status,
        }),
        303
      );
    }

    const updateResult = await donationService.updateDonationStatus(orderId, status, {
      ...data,
      transaction_id: data.tracking_id || data.bank_ref_no,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    });

    if (!updateResult.success) {
      console.error('Failed to update donation after payment:', updateResult.error);
    }

    if (status === 'completed') {
      return NextResponse.redirect(buildSuccessRedirect(baseUrl, orderId), 303);
    }

    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        order_id: orderId,
        message:
          data.failure_message ||
          data.status_message ||
          (status === 'cancelled' ? 'Payment cancelled' : 'Payment failed'),
        failure_message: data.failure_message,
        amount: data.amount,
        status_message: data.order_status || status,
      }),
      303
    );
  } catch (error: any) {
    console.error('ccavenue-response error:', error);
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        message: error.message || 'Payment processing failed',
      }),
      303
    );
  }
}

export async function POST(request: Request) {
  return handlePaymentResponse(request);
}

export async function GET(request: Request) {
  return handlePaymentResponse(request);
}
