import { NextRequest, NextResponse } from 'next/server';
import { normalizeSupportMobile } from '@/lib/joinFormSupport';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body.message !== 'string' || !body.message.trim() || body.message.length > 2000) {
      return NextResponse.json({ success: false, message: 'Describe your problem in 1–2000 characters.' }, { status: 400 });
    }
    const mobile = normalizeSupportMobile(body.mobile);
    if (!mobile) {
      return NextResponse.json({ success: false, message: 'Enter a contact phone number with 4–14 digits.' }, { status: 400 });
    }
    const endpoint = process.env.JOIN_SUPPORT_EMAIL_URL || 'https://svsamiti.com/prabasiodia/feedback.php';
    const token = process.env.JOIN_SUPPORT_EMAIL_TOKEN;
    const response = await fetch(endpoint, {
      method: 'POST', body: JSON.stringify({ mobile, message: body.message.trim() }),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(20_000), cache: 'no-store',
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.status !== true) {
      return NextResponse.json({ success: false, message: 'Your message could not be sent. Please try again or contact us on WhatsApp.' }, { status: 502 });
    }
    // Never forward provider responses: they may contain recipient addresses.
    return NextResponse.json({ success: true, message: 'Your message has been sent to our support team.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof SyntaxError ? 'Invalid request.' : 'Your message could not be sent. Please try again or contact us on WhatsApp.' }, { status: error instanceof SyntaxError ? 400 : 502 });
  }
}
