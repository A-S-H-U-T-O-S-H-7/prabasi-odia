import { NextRequest, NextResponse } from 'next/server';
import { generateMemberCardBundle } from '@/lib/services/memberCardPDF';
import { resolveMemberCardInput } from '@/lib/services/memberCardData';
import { adminAuth, adminDb } from '@/lib/firebase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return NextResponse.json({ error: 'Please sign in to view your member card.' }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const requestedUid = (await request.json().catch(() => null))?.uid;
    let uid = decoded.uid;

    if (requestedUid && requestedUid !== decoded.uid) {
      const adminSnapshot = await adminDb.collection('admins').doc(decoded.uid).get();
      let admin = adminSnapshot.data();
      if (!admin && decoded.email) {
        const legacyAdminSnapshot = await adminDb.collection('admins')
          .where('email', '==', decoded.email.toLowerCase())
          .limit(1)
          .get();
        admin = legacyAdminSnapshot.docs[0]?.data();
      }
      const canViewMembers = admin?.status === 'active' &&
        (admin.role === 'super_admin' || admin.permissions?.includes('users'));
      if (!canViewMembers) return NextResponse.json({ error: 'You are not authorized to view this member card.' }, { status: 403 });
      uid = String(requestedUid);
    }

    const saved = await adminDb.collection('users').doc(uid).get();
    if (!saved.exists) return NextResponse.json({ error: 'Could not load this membership. Please try again.' }, { status: 404 });
    const user = saved.data() || {};
    // Support approved records created before isVerified was consistently
    // stored alongside applicationStatus.
    const approved = user.isVerified === true || user.applicationStatus === 'approved';
    if (!approved || !user.memberId || user.memberId === 'Pending') {
      return NextResponse.json({ error: 'Your member card will be available after your application is approved.' }, { status: 403 });
    }
    const input = resolveMemberCardInput(user, process.env.NEXT_PUBLIC_BASE_URL || 'https://prabasiodia.svsamiti.com');
    const bundle = await generateMemberCardBundle(input);
    return NextResponse.json({
      front: `data:image/png;base64,${bundle.front.toString('base64')}`,
      back: `data:image/png;base64,${bundle.back.toString('base64')}`,
      pdf: bundle.pdf.toString('base64'),
      fileName: `${input.memberId.replace(/[^a-zA-Z0-9_-]/g, '-')}-member-card.pdf`,
      designVersion: bundle.designVersion,
      details: { name: input.name, memberId: input.memberId, memberSince: input.memberSince, bloodGroup: input.bloodGroup, location: input.location, communityName: input.communityName, residencyStatus: input.residencyStatus },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Member card rendering failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not prepare your member card. Please try again.' }, { status: 500 });
  }
}
