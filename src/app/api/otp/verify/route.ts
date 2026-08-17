import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase/server';
import { MAX_OTP_ATTEMPTS, normalizeIndianPhone } from '@/lib/mobileVerification';

export const runtime = 'nodejs';

type VerificationResult = 'verified' | 'invalid' | 'expired' | 'not_found' | 'attempt_limit' | 'already_verified';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = normalizeIndianPhone(body.phone);
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';

    if (!phone || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'A valid mobile number and 6-digit OTP are required' },
        { status: 400 }
      );
    }

    const document = adminDb.collection('mobile_verifications').doc(phone);
    const result = await adminDb.runTransaction<VerificationResult>(async (transaction) => {
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

    if (result === 'verified' || result === 'already_verified') {
      return NextResponse.json({ success: true, message: 'Mobile number verified successfully' });
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
