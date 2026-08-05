import { NextResponse } from 'next/server';
import {
  buildFailedRedirect,
  decryptCCAvenueResponse,
  extractEncResp,
  getRequestBaseUrl,
  mapOrderStatus,
} from '@/lib/payment/ccavenue';
import {
  getDonationById,
  markDonationCancelled,
  updateDonationFromPayment,
} from '@/lib/services/donationServerService';

async function handleCancelReturn(request: Request) {
  const baseUrl = getRequestBaseUrl(request);
  const url = new URL(request.url);
  const encResp = await extractEncResp(request);

  if (encResp) {
    const decrypted = await decryptCCAvenueResponse(encResp);
    if (decrypted.ok && decrypted.data?.order_id) {
      const orderId = String(decrypted.data.order_id).trim();
      const mappedStatus = mapOrderStatus(decrypted.data.order_status);
      const status = mappedStatus === 'completed' ? 'completed' : 'cancelled';

      if (status === 'completed') {
        await updateDonationFromPayment(orderId, 'completed', decrypted.data);
        return NextResponse.redirect(`${baseUrl}/donation/success?order_id=${encodeURIComponent(orderId)}`);
      }

      await markDonationCancelled(
        orderId,
        decrypted.data.failure_message ||
          decrypted.data.status_message ||
          'Payment was cancelled'
      );

      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, {
          order_id: orderId,
          message: 'Payment was cancelled',
          failure_message:
            decrypted.data.failure_message ||
            decrypted.data.status_message ||
            'Payment was cancelled',
          status_message: decrypted.data.order_status || 'Cancelled',
        })
      );
    }
  }

  const orderId = url.searchParams.get('order_id') || url.searchParams.get('orderId');
  if (orderId) {
    const donation = await getDonationById(orderId);
    if (donation && donation.status !== 'completed') {
      await markDonationCancelled(orderId, 'Payment was cancelled');
    }

    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        order_id: orderId,
        message: 'Payment was cancelled',
        failure_message: 'Payment was cancelled',
        status_message: 'Cancelled',
        amount: donation ? String(donation.amount) : undefined,
      })
    );
  }

  return NextResponse.redirect(
    buildFailedRedirect(baseUrl, {
      message: 'Payment was cancelled',
      failure_message: 'Payment was cancelled',
      status_message: 'Cancelled',
    })
  );
}

export async function GET(request: Request) {
  try {
    return await handleCancelReturn(request);
  } catch (error: any) {
    console.error('ccavenue-cancel GET error:', error);
    const baseUrl = getRequestBaseUrl(request);
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        message: error.message || 'Payment cancellation failed',
      })
    );
  }
}

export async function POST(request: Request) {
  try {
    return await handleCancelReturn(request);
  } catch (error: any) {
    console.error('ccavenue-cancel POST error:', error);
    const baseUrl = getRequestBaseUrl(request);
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        message: error.message || 'Payment cancellation failed',
      })
    );
  }
}
