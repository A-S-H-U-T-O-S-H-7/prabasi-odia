// app/api/email/welcome/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // ✅ Server-side request (no CORS issues)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);

    const response = await fetch('https://svsamiti.com/prabasiodia/welcom.php', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Prabasi-Odia/1.0',
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}