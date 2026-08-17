import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase/server';
import {
  generateOtp,
  MAX_OTP_RESENDS,
  normalizeIndianPhone,
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '@/lib/mobileVerification';

export const runtime = 'nodejs';

async function sendSms(phone: string, otp: string) {
  const username = process.env.SMSJUST_USERNAME;
  const password = process.env.SMSJUST_PASSWORD;
  const senderId = process.env.SMSJUST_SENDER_ID;

  if (!username || !password || !senderId) {
    throw new Error('SMSJust credentials are not configured');
  }

  const messageTemplate =
    process.env.SMSJUST_MESSAGE_TEMPLATE ??
    'Your OTP for new user registration is {otp}. Keep this OTP confidential. Team ATDSVS';
  const query = new URLSearchParams({
    username,
    pass: password,
    senderid: senderId,
    dest_mobileno: phone.slice(1),
    message: messageTemplate.replaceAll('{otp}', otp),
    response: 'Y',
    msgtype: 'TXT',
    dlttempid: process.env.SMSJUST_DLT_TEMPLATE_ID ?? '1501726520000010953',
  });

  const response = await fetch(
    `http://www.smsjust.com/blank/sms/user/urlsms.php?${query.toString()}`,
    { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(10_000) }
  );
  const body = await response.text();

  if (!response.ok || /invalid|error|fail/i.test(body)) {
    throw new Error(`SMSJust rejected the request (${response.status})`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = normalizeIndianPhone(body.phone);

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'A valid Indian mobile number is required' },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    const document = adminDb.collection('mobile_verifications').doc(phone);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      now.toMillis() + OTP_EXPIRY_MINUTES * 60_000
    );

    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(document);
      const existing = snapshot.data();

      if (existing?.updatedAt instanceof Timestamp) {
        const secondsSinceLastSend = (now.toMillis() - existing.updatedAt.toMillis()) / 1000;
        if (existing.status === 'pending' && secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
          throw new Error('OTP_COOLDOWN');
        }
      }

      const resendCount = snapshot.exists ? Number(existing?.resendCount ?? 0) + 1 : 0;
      if (resendCount > MAX_OTP_RESENDS) throw new Error('OTP_RESEND_LIMIT');

      transaction.set(document, {
        phone,
        otp,
        status: 'pending',
        attempts: 0,
        resendCount,
        createdAt: snapshot.exists ? existing?.createdAt ?? now : now,
        expiresAt,
        verifiedAt: null,
        updatedAt: now,
      });
    });

    try {
      await sendSms(phone, otp);
    } catch (error) {
      await document.update({ status: 'delivery_failed', updatedAt: FieldValue.serverTimestamp() });
      console.error('OTP SMS delivery failed:', error instanceof Error ? error.message : error);
      return NextResponse.json(
        { success: false, message: 'Unable to send OTP. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'OTP_COOLDOWN') {
      return NextResponse.json(
        { success: false, message: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP` },
        { status: 429 }
      );
    }
    if (error instanceof Error && error.message === 'OTP_RESEND_LIMIT') {
      return NextResponse.json(
        { success: false, message: 'OTP resend limit reached' },
        { status: 429 }
      );
    }

    console.error('Create OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to create OTP' },
      { status: 500 }
    );
  }
}
