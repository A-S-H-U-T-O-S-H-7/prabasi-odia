// app/api/payment/donation-response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { donationService } from '@/lib/services/donationService';

export async function POST(request: NextRequest) {
  try {
    let encResp: string | null = null;
    
    const contentType = request.headers.get('content-type') || '';
    
    // ✅ Get encrypted response from request
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      encResp = formData.get('encResp') as string;
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      encResp = body.encResp;
    } else {
      const text = await request.text();
      if (text.includes('encResp=')) {
        const urlParams = new URLSearchParams(text);
        encResp = urlParams.get('encResp');
      }
    }

    if (!encResp) {
      console.error('Missing encResp in donation response');
      // Redirect to failed page
      const failedUrl = new URL('/donate/failed', process.env.NEXT_PUBLIC_BASE_URL);
      failedUrl.searchParams.set('message', 'Payment response missing');
      return NextResponse.redirect(failedUrl.toString());
    }

    console.log('Processing donation payment response...');

    // ✅ Call CCAvenue response handler
    const response = await fetch(`${process.env.CCAVENUE_RESPONSE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Prabasi-Odia-Donation/1.0',
      },
      body: new URLSearchParams({
        encResp: encResp
      })
    });

    if (!response.ok) {
      throw new Error(`CCAvenue response handler returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.status && data.data) {
      const paymentInfo = data.data;
      
      // ✅ Update donation status in Firebase
      try {
        if (paymentInfo.order_id) {
          const status = paymentInfo.order_status === 'Success' ? 'completed' : 'failed';
          
          await donationService.updateDonationStatus(
            paymentInfo.order_id,
            status as any,
            paymentInfo
          );
          
          console.log(`✅ Donation ${paymentInfo.order_id} status updated to: ${status}`);
        }
      } catch (error) {
        console.error('Error updating donation status:', error);
        // Continue - don't fail the response
      }

      // ✅ Redirect based on payment status
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      if (paymentInfo.order_status === 'Success') {
        const successUrl = new URL('/donate/success', baseUrl);
        successUrl.searchParams.set('order_id', paymentInfo.order_id || '');
        successUrl.searchParams.set('status', 'success');
        successUrl.searchParams.set('amount', paymentInfo.amount || '0');
        successUrl.searchParams.set('tracking_id', paymentInfo.tracking_id || '');
        successUrl.searchParams.set('name', paymentInfo.merchant_param1 || '');
        successUrl.searchParams.set('email', paymentInfo.merchant_param2 || '');
        
        // ✅ Return HTML that redirects
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Payment Successful</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: 'Georgia', serif;
                background: linear-gradient(135deg, #6B1E5B 0%, #8A2E72 50%, #D9772B 100%);
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: white;
              }
              .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 2rem 3rem;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                max-width: 500px;
              }
              .spinner {
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top: 4px solid white;
                width: 48px;
                height: 48px;
                animation: spin 1s linear infinite;
                margin: 0 auto 1.5rem;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              h2 { font-size: 24px; margin-bottom: 8px; }
              p { opacity: 0.8; font-size: 16px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="spinner"></div>
              <h2>✨ Payment Successful!</h2>
              <p>Thank you for your generous donation.</p>
              <p style="margin-top: 8px; font-size: 14px; opacity: 0.6;">Redirecting to confirmation...</p>
            </div>
            <script>
              setTimeout(function() {
                window.location.href = '${successUrl.toString()}';
              }, 2000);
            </script>
          </body>
          </html>
        `, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        
      } else {
        const failedUrl = new URL('/donate/failed', baseUrl);
        failedUrl.searchParams.set('order_id', paymentInfo.order_id || '');
        failedUrl.searchParams.set('message', paymentInfo.failure_message || 'Payment failed');
        failedUrl.searchParams.set('failure_message', paymentInfo.failure_message || 'Payment processing failed');
        failedUrl.searchParams.set('status_message', paymentInfo.status_message || 'Failed');
        failedUrl.searchParams.set('amount', paymentInfo.amount || '0');
        failedUrl.searchParams.set('tracking_id', paymentInfo.tracking_id || '');
        failedUrl.searchParams.set('payment_method', paymentInfo.payment_mode || '');
        
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Payment Failed</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: 'Georgia', serif;
                background: linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #DC2626 100%);
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: white;
              }
              .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 2rem 3rem;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                max-width: 500px;
              }
              .spinner {
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top: 4px solid white;
                width: 48px;
                height: 48px;
                animation: spin 1s linear infinite;
                margin: 0 auto 1.5rem;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              h2 { font-size: 24px; margin-bottom: 8px; }
              p { opacity: 0.8; font-size: 16px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="spinner"></div>
              <h2>❌ Payment Failed</h2>
              <p>Your donation could not be processed.</p>
              <p style="margin-top: 8px; font-size: 14px; opacity: 0.6;">Redirecting to try again...</p>
            </div>
            <script>
              setTimeout(function() {
                window.location.href = '${failedUrl.toString()}';
              }, 2000);
            </script>
          </body>
          </html>
        `, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      }
    }

    // ✅ Fallback: If response is not as expected
    const failedUrl = new URL('/donate/failed', process.env.NEXT_PUBLIC_BASE_URL);
    failedUrl.searchParams.set('message', 'Invalid payment response');
    return NextResponse.redirect(failedUrl.toString());

  } catch (error: any) {
    console.error('Donation response error:', error);
    const failedUrl = new URL('/donate/failed', process.env.NEXT_PUBLIC_BASE_URL);
    failedUrl.searchParams.set('message', error.message || 'Payment processing failed');
    return NextResponse.redirect(failedUrl.toString());
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests (CCAvenue might redirect with GET)
  try {
    const { searchParams } = new URL(request.url);
    const encResp = searchParams.get('encResp');
    
    if (!encResp) {
      const failedUrl = new URL('/donate/failed', process.env.NEXT_PUBLIC_BASE_URL);
      failedUrl.searchParams.set('message', 'Missing payment response');
      return NextResponse.redirect(failedUrl.toString());
    }
    
    // Forward to POST handler
    const formData = new FormData();
    formData.append('encResp', encResp);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/donation-response`, {
      method: 'POST',
      body: formData
    });
    
    return response;
    
  } catch (error: any) {
    console.error('Donation response GET error:', error);
    const failedUrl = new URL('/donate/failed', process.env.NEXT_PUBLIC_BASE_URL);
    failedUrl.searchParams.set('message', error.message || 'Payment processing failed');
    return NextResponse.redirect(failedUrl.toString());
  }
}