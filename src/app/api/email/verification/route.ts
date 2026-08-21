import { NextRequest, NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase/server';
import {
  formatMemberSince,
  resolveBloodGroup,
  resolveLocation,
  resolveMemberId,
  resolveMemberName,
  resolvePhotoURL,
} from '@/lib/services/memberCardData';
import { generateMemberCardPng } from '@/lib/services/memberCardPDF';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function loadUserData(uid?: string) {
  if (!uid) return {};
  const snapshot = await adminDb.collection('users').doc(uid).get();
  return snapshot.exists ? snapshot.data() || {} : {};
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const userData = await loadUserData(payload.uid);

    const name = resolveMemberName(userData, payload.name);
    const email = String(payload.email || userData.email || '').trim();
    const memberId = resolveMemberId(userData, payload.memberId);
    const communityName =
      payload.communityName ||
      userData.nearbyCommunityName ||
      userData.requestedCommunityName ||
      'Prabasi Odia Community';
    const bloodGroup = resolveBloodGroup(userData, payload.bloodGroup);
    const location = resolveLocation(userData, payload.location);
    const photoURL = resolvePhotoURL(userData, payload.photoURL);
    const memberSince = formatMemberSince(payload.memberSince || userData.createdAt);

    if (!name || !email || !memberId || memberId === 'Pending') {
      return NextResponse.json(
        { success: false, message: 'Name, email, and member ID are required' },
        { status: 400 }
      );
    }

    let memberCardPng: Buffer | null = null;

    try {
      memberCardPng = await generateMemberCardPng({
        name,
        memberId,
        memberSince,
        bloodGroup,
        location,
        communityName,
        isVerified: true,
        photoURL,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://prabasiodia.svsamiti.com',
      });
    } catch (cardError) {
      console.error('Member card generation failed for verification email:', cardError);
    }

    if (!memberCardPng) {
      return NextResponse.json(
        { success: false, message: 'Failed to generate member card for verification email' },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('member_id', memberId);
    formData.append('member_since', memberSince);
    formData.append('community_name', communityName);
    formData.append('blood_group', bloodGroup);
    formData.append('location', location);
    formData.append('city', String(userData.currentCity || ''));
    formData.append('state', String(userData.currentState || ''));
    formData.append('photo_url', photoURL);
    formData.append('member_card_path', memberCardPng.toString('base64'));
    formData.append(
      'member_card',
      new Blob([new Uint8Array(memberCardPng)], { type: 'image/png' }),
      `${memberId}-member-card.png`
    );

    const response = await fetch('https://svsamiti.com/prabasiodia/verification.php', {
      method: 'POST',
      headers: {
        Accept: '*/*',
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
