import { NextResponse } from 'next/server';
import {
  amountsMatch,
  buildFailedRedirect,
  buildSuccessRedirect,
  decryptCCAvenueResponse,
  extractEncResp,
  getRequestBaseUrl,
  mapOrderStatus,
} from '@/lib/payment/ccavenue';
import {
  getDonationById,
  updateDonationFromPayment,
} from '@/lib/services/donationServerService';

async function handlePaymentReturn(request: Request) {
  const baseUrl = getRequestBaseUrl(request);
  const encResp = await extractEncResp(request);

  if (!encResp) {
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        message: 'Missing encrypted payment response',
      })
    );
  }

  const decrypted = await decryptCCAvenueResponse(encResp);
  if (!decrypted.ok || !decrypted.data) {
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        message: decrypted.error || 'Unable to process payment response',
      })
    );
  }

  const payment = decrypted.data;
  const orderId = String(payment.order_id || '').trim();
  if (!orderId) {
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        message: 'Payment response did not include an order ID',
      })
    );
  }

  const donation = await getDonationById(orderId);
  if (!donation) {
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        order_id: orderId,
        message: 'Donation record not found',
      })
    );
  }

  const mappedStatus = mapOrderStatus(payment.order_status);
  const finalStatus =
    mappedStatus === 'completed' && !amountsMatch(donation.amount, payment.amount)
      ? 'failed'
      : mappedStatus;

  if (finalStatus !== 'completed' && mappedStatus === 'completed') {
    payment.failure_message =
      payment.failure_message || 'Payment amount did not match the donation record';
    payment.status_message = 'Amount mismatch';
  }

  const updateResult = await updateDonationFromPayment(orderId, finalStatus, payment);
  if (!updateResult.success) {
    console.error('Donation update failed:', updateResult.error);
  }

  if (finalStatus === 'completed') {
    return NextResponse.redirect(buildSuccessRedirect(baseUrl, orderId));
  }

  return NextResponse.redirect(
    buildFailedRedirect(baseUrl, {
      order_id: orderId,
      amount: String(donation.amount),
      message:
        payment.failure_message ||
        payment.status_message ||
        (finalStatus === 'cancelled' ? 'Payment was cancelled' : 'Payment failed'),
      failure_message:
        payment.failure_message ||
        payment.status_message ||
        (finalStatus === 'cancelled' ? 'Payment was cancelled' : 'Payment failed'),
      status_message: payment.order_status || finalStatus,
    })
  );
}

export async function POST(request: Request) {
  try {
    return await handlePaymentReturn(request);
  } catch (error: any) {
    console.error('ccavenue-response error:', error);
    const baseUrl = getRequestBaseUrl(request);
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        message: error.message || 'Payment processing failed',
      })
    );
  }
}

export async function GET(request: Request) {
  try {
    return await handlePaymentReturn(request);
  } catch (error: any) {
    console.error('ccavenue-response GET error:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
