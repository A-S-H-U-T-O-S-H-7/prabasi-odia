import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';
import { normalizeEmail } from '@/lib/mobileVerification';

export const runtime = 'nodejs';

const EMAIL_OTP_SEND_URL = process.env.EMAIL_OTP_SEND_URL || 'https://svsamiti.com/prabasiodia/email-otp.php';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(authorization.slice(7));
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const email = normalizeEmail(decoded.email);
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const name = body.name || email.split('@')[0];

    // Call your PHP endpoint
    const formData = new FormData();
    formData.append('email', email);
    formData.append('name', name);

    const response = await fetch(EMAIL_OTP_SEND_URL, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { status: response.ok, message: response.ok ? 'OTP sent' : 'Failed to send OTP' };
    }

    if (!response.ok || data?.status !== true) {
      throw new Error(data?.message || 'Failed to send email OTP');
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'OTP sent to your email',
    });
  } catch (error) {
    console.error('Email OTP send error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 }
    );
  }
}