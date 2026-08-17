import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const OTP_EMAIL_ENDPOINT =
  process.env.OTP_EMAIL_ENDPOINT || 'https://svsamiti.com/prabasiodia/otp.php';

export async function POST(request: NextRequest) {
  try {
    const { name, email, otp } = await request.json();

    if (!name || !email || !otp) {
      return NextResponse.json(
        { success: false, status: false, message: 'Name, email, and OTP are required' },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('otp', otp);

    const response = await fetch(OTP_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'User-Agent': 'Prabasi-Odia/1.0',
      },
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status !== true) {
      return NextResponse.json(
        {
          success: false,
          status: false,
          message: data?.message || 'Failed to send OTP email',
        },
        { status: response.ok ? 502 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      status: true,
      message: data?.message || 'OTP sent to email',
    });
  } catch (error) {
    console.error('OTP email error:', error);
    return NextResponse.json(
      { success: false, status: false, message: 'Failed to send OTP email' },
      { status: 500 }
    );
  }
}
