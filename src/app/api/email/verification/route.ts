import { NextRequest, NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase/server';
import { generateMemberCardPDF } from '@/lib/services/memberCardPDF';

export const runtime = 'nodejs';
export const maxDuration = 60;

function formatMemberSince(value?: string) {
  if (!value) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function buildMemberCardBase64(payload: {
  uid?: string;
  name?: string;
  memberId?: string;
  memberSince?: string;
  bloodGroup?: string;
  location?: string;
  photoURL?: string;
}) {
  let userData: Record<string, any> = {};

  if (payload.uid) {
    const snapshot = await adminDb.collection('users').doc(payload.uid).get();
    if (snapshot.exists) {
      userData = snapshot.data() || {};
    }
  }

  const memberId = payload.memberId || userData.memberId;
  if (!memberId || memberId === 'Pending') {
    throw new Error('Member ID is required to generate the member card');
  }

  const location =
    payload.location ||
    [userData.currentCity, userData.currentState].filter(Boolean).join(', ');

  const pdfBuffer = await generateMemberCardPDF({
    name: payload.name || userData.displayName || 'Member',
    memberId,
    memberSince: payload.memberSince || formatMemberSince(userData.createdAt),
    bloodGroup: payload.bloodGroup || userData.bloodGroup || '',
    location,
    isVerified: true,
    photoURL: payload.photoURL || userData.photoURL || userData.documents?.profilePhoto || '',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://prabasiodia.svsamiti.com',
  });

  return pdfBuffer.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const {
      uid,
      name,
      email,
      memberId,
      memberSince,
      communityName,
      bloodGroup,
      location,
      photoURL,
    } = await request.json();

    if (!name || !email || !memberId) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and member ID are required' },
        { status: 400 }
      );
    }

    const formattedMemberSince = formatMemberSince(memberSince);
    let memberCardBase64 = '';

    try {
      memberCardBase64 = await buildMemberCardBase64({
        uid,
        name,
        memberId,
        memberSince: formattedMemberSince,
        bloodGroup,
        location,
        photoURL,
      });
    } catch (cardError) {
      console.error('Member card generation failed for verification email:', cardError);
    }

    if (!memberCardBase64) {
      return NextResponse.json(
        { success: false, message: 'Failed to generate member card for verification email' },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('member_id', memberId);
    formData.append('member_since', formattedMemberSince);
    formData.append('community_name', communityName || 'Prabasi Odia Community');
    formData.append('member_card_path', memberCardBase64);

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
