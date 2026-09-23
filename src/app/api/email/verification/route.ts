import { NextRequest, NextResponse } from 'next/server';
import { resolveMemberCardInput } from '@/lib/services/memberCardData';
import { generateMemberCardPDF } from '@/lib/services/memberCardPDF';
import { createVerificationForm, sendVerificationForm } from '@/lib/services/verificationEmailProvider';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let stage: 'request' | 'card' | 'provider' = 'request';
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('Invalid verification request.');
    }
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const memberId = typeof payload.memberId === 'string' ? payload.memberId.trim() : '';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !memberId || memberId === 'Pending') {
      throw new Error('Name, valid email, and member ID are required.');
    }
    const communityName = typeof payload.communityName === 'string' && payload.communityName.trim()
      ? payload.communityName.trim() : 'Prabasi Odia Community';
    const memberSince = payload.memberSince || new Date().toISOString();

    // Generate using the admin's selected member ID before saving approval.
    // No call to the already-verified-only /api/member-card-pdf is needed.
    stage = 'card';
    const card = await generateMemberCardPDF(resolveMemberCardInput({
      ...payload, name, memberId, communityName, memberSince, isVerified: true,
    }, process.env.NEXT_PUBLIC_BASE_URL || 'https://prabasiodia.svsamiti.com'));
    const form = createVerificationForm({ name, email, memberId, communityName, memberSince }, card);

    // Browser-direct delivery: prepare the six PHP fields, but do not send mail.
    // This uses the same generator without weakening /api/member-card-pdf's
    // verified-member restriction or exposing its API key to the browser.
    if (new URL(request.url).searchParams.get('prepareOnly') === '1') {
      return NextResponse.json({ success: true, fields: Object.fromEntries(form.entries()) }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Local preview tests the actual Next.js renderer without sending email.
    if (process.env.NODE_ENV === 'development' && new URL(request.url).searchParams.get('preview') === '1') {
      return new Response(new Uint8Array(card), {
        headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' },
      });
    }

    stage = 'provider';
    const result = await sendVerificationForm(form);
    return NextResponse.json({ status: result.success, ...result }, { status: result.success ? 200 : 502 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    const code = typeof error === 'object' && error && 'code' in error ? error.code : undefined;
    // Do not log Axios objects: they include recipient details and the PDF.
    console.error(`Verification ${stage} failed: ${detail}`);
    const timeout = code === 'ECONNABORTED' || code === 'ETIMEDOUT';
    const message = stage === 'request' ? detail
      : stage === 'card' ? 'Could not generate the member-card PDF. No email was sent.'
        : timeout ? 'The email provider timed out. Delivery could not be confirmed.'
          : 'Could not contact the email provider. Delivery could not be confirmed.';
    return NextResponse.json({ status: false, success: false, message }, {
      status: stage === 'request' ? 400 : stage === 'card' ? 500 : timeout ? 504 : 502,
    });
  }
}
