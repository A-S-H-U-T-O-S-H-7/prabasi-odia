import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let encResp: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      encResp = formData.get('encResp') as string | null;
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      encResp = body?.encResp || null;
    }

    if (!encResp) {
      return NextResponse.json({ status: false, message: 'Missing encrypted response' }, { status: 400 });
    }

    const response = await fetch('https://svsamiti.com/prabasiodia/ccavResponseHandler.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Prabasi-Odia-Donation/1.0',
      },
      body: new URLSearchParams({ encResp }),
    });

    if (!response.ok) {
      throw new Error(`CCAvenue response handler returned ${response.status}`);
    }

    const text = await response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('ccavenue-response error:', error);
    return NextResponse.json({ status: false, message: error.message || 'Payment processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: false, message: 'Use POST' }, { status: 405 });
}
