// app/api/email/welcome/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { normalizeEmail } from '@/lib/mobileVerification';

export async function POST(request: NextRequest) {
  try {
    const { name, email: inputEmail } = await request.json();
    const email = normalizeEmail(inputEmail);

    if (typeof name !== 'string' || !name.trim() || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // ✅ Server-side request (no CORS issues)
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email);

    const response = await fetch('https://svsamiti.com/prabasiodia/welcom.php', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Prabasi-Odia/1.0',
      },
      body: formData,
      signal: AbortSignal.timeout(20_000),
    });

    const data = await response.json().catch(() => null);
    const sent = response.ok && (data?.status === true || data?.success === true);
    return NextResponse.json(
      { status: sent, message: data?.message || (sent ? 'Confirmation email sent' : 'Failed to send confirmation email') },
      { status: sent ? 200 : 502 }
    );

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
