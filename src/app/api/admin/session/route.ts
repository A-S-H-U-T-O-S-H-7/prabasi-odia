import { NextRequest, NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  signAdminSession,
  verifyAdminSession,
} from '@/lib/admin/session';
import { Admin } from '@/types/admin';
import type { Firestore } from 'firebase-admin/firestore';

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

async function findActiveAdmin(adminDb: Firestore, email: string, uid: string) {
  // Current admin records use the Firebase Auth UID as their document ID.
  // Prefer a direct lookup, which is faster and needs no Firestore index.
  const byDocumentId = await adminDb.collection('admins').doc(uid).get();
  if (byDocumentId.exists && byDocumentId.data()?.status === 'active') {
    return byDocumentId;
  }

  // Retain email lookup for legacy admin records created with another doc ID.
  const byEmail = await adminDb
    .collection('admins')
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (!byEmail.empty && byEmail.docs[0].data().status === 'active') {
    return byEmail.docs[0];
  }

  return null;
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', adminSessionCookieOptions(0));
  return response;
}

export async function POST(request: NextRequest) {
  try {
    // Load Firebase Admin inside the handler so configuration errors produce a
    // JSON response instead of an empty platform-level 500 response.
    const { adminAuth, adminDb } = await import('@/lib/firebase/server');
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

    const adminDoc = await findActiveAdmin(adminDb, email, decoded.uid);

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
    const errorCode =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code || '')
        : '';

    if (error instanceof Error && error.message === 'ADMIN_SESSION_SECRET is not configured') {
      return NextResponse.json(
        { success: false, error: 'Admin login is not configured. Set ADMIN_SESSION_SECRET on the server.' },
        { status: 500 }
      );
    }
    if (
      error instanceof Error &&
      (error.message.includes('Firebase') ||
        error.message.includes('service account') ||
        error.message.includes('PEM'))
    ) {
      return NextResponse.json(
        { success: false, error: 'Admin login is not configured correctly on the server.' },
        { status: 500 }
      );
    }
    if (
      errorCode === 'auth/argument-error' ||
      errorCode === 'auth/id-token-expired' ||
      errorCode === 'auth/id-token-revoked' ||
      errorCode === 'auth/user-disabled'
    ) {
      return NextResponse.json(
        { success: false, error: 'Your login token was rejected. Please sign in again.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Admin login could not access the server database.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { adminDb } = await import('@/lib/firebase/server');
    const session = await verifyAdminSession(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );

    if (!session) {
      return clearSessionCookie(NextResponse.json({ success: false }, { status: 401 }));
    }

    const adminDoc = await findActiveAdmin(adminDb, session.email, session.uid);

    if (!adminDoc) {
      return clearSessionCookie(NextResponse.json({ success: false }, { status: 401 }));
    }

    return NextResponse.json({
      success: true,
      admin: toAdmin(session.uid, adminDoc.data() || {}),
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
