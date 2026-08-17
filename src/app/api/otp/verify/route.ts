import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/lib/firebase/server';
import { MAX_OTP_ATTEMPTS, normalizeEmail, normalizeIndianPhone } from '@/lib/mobileVerification';

export const runtime = 'nodejs';

type VerificationResult = 'verified' | 'invalid' | 'expired' | 'not_found' | 'attempt_limit' | 'already_verified';

async function resolveEmail(request: NextRequest, fallbackEmail: unknown) {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    try {
      const decoded = await adminAuth.verifyIdToken(authorization.slice(7));
      const tokenEmail = normalizeEmail(decoded.email);
      if (tokenEmail) return tokenEmail;
    } catch (error) {
      console.error('OTP email auth token error:', error);
    }
  }

  return normalizeEmail(fallbackEmail);
}

async function verifyOtpDocument(
  collection: string,
  docId: string,
  otp: string
): Promise<VerificationResult> {
  const document = adminDb.collection(collection).doc(docId);

  return adminDb.runTransaction<VerificationResult>(async (transaction) => {
    const snapshot = await transaction.get(document);
    if (!snapshot.exists) return 'not_found';

    const data = snapshot.data()!;
    if (data.status === 'verified') return 'already_verified';
    if (Number(data.attempts ?? 0) >= MAX_OTP_ATTEMPTS) return 'attempt_limit';

    const now = Timestamp.now();
    if (!(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= now.toMillis()) {
      transaction.update(document, { status: 'expired', updatedAt: now });
      return 'expired';
    }

    if (data.otp !== otp) {
      const attempts = Number(data.attempts ?? 0) + 1;
      transaction.update(document, {
        attempts,
        status: attempts >= MAX_OTP_ATTEMPTS ? 'failed' : 'pending',
        updatedAt: now,
      });
      return attempts >= MAX_OTP_ATTEMPTS ? 'attempt_limit' : 'invalid';
    }

    transaction.update(document, {
      status: 'verified',
      verifiedAt: now,
      updatedAt: now,
    });
    return 'verified';
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
    const channel = body.channel === 'email' || body.email ? 'email' : 'sms';

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'A valid 6-digit OTP is required' },
        { status: 400 }
      );
    }

    if (channel === 'email') {
      const email = await resolveEmail(request, body.email);
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'A valid login email and 6-digit OTP are required' },
          { status: 400 }
        );
      }

      const result = await verifyOtpDocument('email_verifications', email, otp);

      if (result === 'verified' || result === 'already_verified') {
        return NextResponse.json({ success: true, channel, message: 'Email verified successfully' });
      }

      const messages: Record<Exclude<VerificationResult, 'verified' | 'already_verified'>, string> = {
        invalid: 'Invalid OTP',
        expired: 'OTP has expired. Please request a new one.',
        not_found: 'No OTP request was found for this email',
        attempt_limit: 'Maximum OTP verification attempts reached',
      };

      return NextResponse.json(
        { success: false, message: messages[result] },
        { status: result === 'attempt_limit' ? 429 : 400 }
      );
    }

    const phone = normalizeIndianPhone(body.phone);

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'A valid mobile number and 6-digit OTP are required' },
        { status: 400 }
      );
    }

    const result = await verifyOtpDocument('mobile_verifications', phone, otp);

    if (result === 'verified' || result === 'already_verified') {
      return NextResponse.json({ success: true, channel: 'sms', message: 'Mobile number verified successfully' });
    }

    const messages: Record<Exclude<VerificationResult, 'verified' | 'already_verified'>, string> = {
      invalid: 'Invalid OTP',
      expired: 'OTP has expired. Please request a new one.',
      not_found: 'No OTP request was found for this mobile number',
      attempt_limit: 'Maximum OTP verification attempts reached',
    };

    return NextResponse.json(
      { success: false, message: messages[result] },
      { status: result === 'attempt_limit' ? 429 : 400 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
    }
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to verify OTP' },
      { status: 500 }
    );
  }
}
