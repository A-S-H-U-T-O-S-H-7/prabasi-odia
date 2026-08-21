import { NextRequest, NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  signAdminSession,
  verifyAdminSession,
} from '@/lib/admin/session';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { Admin } from '@/types/admin';

export const runtime = 'nodejs';

function toAdmin(uid: string, data: Record<string, any>): Admin {
  return {
    uid,
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    permissions: data.permissions || [],
    createdAt: data.createdAt,
    lastLoginAt: data.lastLoginAt ?? null,
  };
}

async function findActiveAdmin(email: string, uid: string) {
  const byEmail = await adminDb
    .collection('admins')
    .where('email', '==', email.toLowerCase())
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (!byEmail.empty) {
    return byEmail.docs[0];
  }

  const byUid = await adminDb
    .collection('admins')
    .where('uid', '==', uid)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  return byUid.empty ? null : byUid.docs[0];
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', adminSessionCookieOptions(0));
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing ID token' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const email = decoded.email?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You are not an admin.' },
        { status: 403 }
      );
    }

    const adminDoc = await findActiveAdmin(email, decoded.uid);

    if (!adminDoc) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You are not an admin.' },
        { status: 403 }
      );
    }

    const adminData = adminDoc.data();
    await adminDoc.ref.update({
      uid: decoded.uid,
      lastLoginAt: new Date().toISOString(),
    });

    const admin = toAdmin(decoded.uid, { ...adminData, uid: decoded.uid });
    const sessionToken = await signAdminSession({
      uid: decoded.uid,
      email,
      role: admin.role,
    });

    const response = NextResponse.json({ success: true, admin });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, adminSessionCookieOptions());
    return response;
  } catch (error: unknown) {
    console.error('Admin session create error:', error);
    if (error instanceof Error && error.message === 'ADMIN_SESSION_SECRET is not configured') {
      return NextResponse.json(
        { success: false, error: 'Admin login is not configured. Set ADMIN_SESSION_SECRET on the server.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );

    if (!session) {
      return clearSessionCookie(NextResponse.json({ success: false }, { status: 401 }));
    }

    const adminDoc = await findActiveAdmin(session.email, session.uid);

    if (!adminDoc) {
      return clearSessionCookie(NextResponse.json({ success: false }, { status: 401 }));
    }

    return NextResponse.json({
      success: true,
      admin: toAdmin(session.uid, adminDoc.data()),
    });
  } catch (error) {
    console.error('Admin session verify error:', error);
    return clearSessionCookie(NextResponse.json({ success: false }, { status: 401 }));
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
