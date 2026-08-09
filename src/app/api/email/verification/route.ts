// app/api/email/verification/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, memberId, memberSince, communityName, memberCardPath } = await request.json();

    if (!name || !email || !memberId) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and member ID are required' },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('member_id', memberId);
    formData.append('member_since', memberSince || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    formData.append('community_name', communityName || 'Prabasi Odia Community');
    formData.append('member_card_path', memberCardPath || `${process.env.NEXT_PUBLIC_BASE_URL}/profile`);

    const response = await fetch('https://svsamiti.com/prabasiodia/verification.php', {
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
    console.error('Verification email error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}