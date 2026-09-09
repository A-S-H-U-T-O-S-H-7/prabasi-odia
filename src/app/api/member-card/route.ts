import { NextRequest, NextResponse } from 'next/server';
import { generateMemberCardBundle } from '@/lib/services/memberCardPDF';
import { resolveMemberCardInput } from '@/lib/services/memberCardData';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface FirestoreValue {
  stringValue?: string;
  timestampValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  mapValue?: { fields?: Record<string, FirestoreValue> };
}
function readFields(fields: Record<string, FirestoreValue> = {}): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key,
    value.stringValue ?? value.timestampValue ?? value.booleanValue ?? value.doubleValue ??
    (value.integerValue !== undefined ? Number(value.integerValue) : value.mapValue ? readFields(value.mapValue.fields) : null),
  ]));
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return NextResponse.json({ error: 'Please sign in to view your member card.' }, { status: 401 });
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return NextResponse.json({ error: 'Member cards are temporarily unavailable.' }, { status: 503 });

  try {
    // Verify the Firebase token without requiring an additional Admin service account.
    const accountResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }),
      cache: 'no-store', signal: AbortSignal.timeout(10_000),
    });
    const account = await accountResponse.json();
    const uid = account.users?.[0]?.localId;
    if (!accountResponse.ok || !uid) return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });

    // Only the signed-in member's saved application can become a verified card.
    const profileResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(10_000),
    });
    if (!profileResponse.ok) return NextResponse.json({ error: 'Could not load your membership. Please try again.' }, { status: profileResponse.status === 404 ? 404 : 502 });
    const saved = await profileResponse.json();
    const user = readFields(saved.fields);
    if (user.isVerified !== true || !user.memberId || user.memberId === 'Pending') {
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
