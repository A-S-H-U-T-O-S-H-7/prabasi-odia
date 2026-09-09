import { NextRequest, NextResponse } from 'next/server';

import {
  formatMemberSince,
  resolveBloodGroup,
  resolveLocation,
  resolveMemberId,
  resolveMemberName,
  resolvePhotoURL,
  resolveMemberCardInput,
} from '@/lib/services/memberCardData';
import { generateMemberCardPDF } from '@/lib/services/memberCardPDF';

export const runtime = 'nodejs';
export const maxDuration = 60;

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
        { success: false, message: 'Name, email, and member ID are required' },
        { status: 400 }
      );
    }

    let memberCardPdf: Buffer | null = null;

    try {
      memberCardPdf = await generateMemberCardPDF(resolveMemberCardInput({
        ...userData, name, memberId, memberSince, bloodGroup, location, communityName, photoURL, isVerified: true,
      }, process.env.NEXT_PUBLIC_BASE_URL || 'https://prabasiodia.svsamiti.com'));
    } catch (cardError) {
      console.error('Member card generation failed for verification email:', cardError);
    }

    if (!memberCardPdf) {
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
    // The mail endpoint's legacy member_card_path field expects PDF bytes as
    // base64. Do not also upload the same multi-megabyte document as a file:
    // duplicating it can exceed PHP's request limit and truncate the download.
    formData.append('member_card_path', memberCardPdf.toString('base64'));
    formData.append('member_card_mime_type', 'application/pdf');
    formData.append('member_card_file_name', `${memberId}-member-card.pdf`);

    const response = await fetch('https://svsamiti.com/prabasiodia/verification.php', {
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
        { success: false, message: 'The email provider returned an invalid response.' },
        { status: 502 }
      );
    }

    const sent = response.ok && (data.status === true || data.success === true);
    return NextResponse.json(
      { status: sent, message: data.message || (sent ? 'Verification email sent' : 'Failed to send verification email') },
      { status: sent ? 200 : 502 }
    );
  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
