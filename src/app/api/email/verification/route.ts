import { NextRequest, NextResponse } from 'next/server';

import {
  formatMemberSince,
  resolveBloodGroup,
  resolveLocation,
  resolveMemberId,
  resolveMemberName,
  resolvePhotoURL,
} from '@/lib/services/memberCardData';

export const runtime = 'nodejs';
export const maxDuration = 60;

const VERIFICATION_EMAIL_URL = 'https://svsamiti.com/prabasiodia/verification.php';
// verification.php expects a URL in member_card_path, not PDF bytes. Keep this
// configurable so the PHP service can receive the exact public path it expects.
const MEMBER_CARD_PATH = process.env.VERIFICATION_MEMBER_CARD_PATH || 'https://svsamiti.com/';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    // This route receives the verified member details from the admin panel.
    // Avoid Firebase Admin here: production email delivery must not depend on
    // a second server credential initialization.
    const userData = payload || {};

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
        { status: false, success: false, message: 'Name, email, and member ID are required' },
        { status: 400 }
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
    formData.append('member_card_path', MEMBER_CARD_PATH);

    const response = await fetch(VERIFICATION_EMAIL_URL, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'User-Agent': 'Prabasi-Odia/1.0',
      },
      body: formData,
      signal: AbortSignal.timeout(30_000),
    });

    const responseText = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      console.error('Verification email provider returned a non-JSON response:', response.status);
      return NextResponse.json(
        { status: false, success: false, message: 'The email provider returned an invalid response.' },
        { status: 502 }
      );
    }

    const sent = response.ok && (data.status === true || data.success === true);
    return NextResponse.json(
      { status: sent, success: sent, message: data.message || (sent ? 'Verification email sent' : 'Failed to send verification email') },
      { status: sent ? 200 : 502 }
    );
  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json(
      { status: false, success: false, message: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
