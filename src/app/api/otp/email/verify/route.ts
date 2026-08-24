// app/api/otp/email/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';
import { normalizeEmail } from '@/lib/mobileVerification';

export const runtime = 'nodejs';

const EMAIL_OTP_VERIFY_URL = process.env.EMAIL_OTP_VERIFY_URL || 'https://svsamiti.com/prabasiodia/verify-email-otp.php';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📧 Email OTP Verify Request body:", body);
    
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
      console.log("✅ User verified:", decoded.uid);
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return NextResponse.json(
        { success: false, message: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // ✅ Get email from body first, fallback to token
    let email = body.email?.trim();
    if (!email) {
      email = normalizeEmail(decoded.email);
    }
    
    if (!email) {
      console.error("❌ No email found");
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const otp = body.otp?.trim();
    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'Valid 6-digit OTP is required' },
        { status: 400 }
      );
    }

    console.log(`📧 Verifying OTP for ${email}: ${otp}`);

    // Call your PHP verification endpoint
    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp', otp);

    const response = await fetch(EMAIL_OTP_VERIFY_URL, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { status: response.ok, message: response.ok ? 'OTP verified' : 'Verification failed' };
    }

    if (!response.ok || data?.status !== true) {
      throw new Error(data?.message || 'Invalid OTP');
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Email verified successfully',
    });
  } catch (error) {
    console.error('❌ Email OTP verify error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}