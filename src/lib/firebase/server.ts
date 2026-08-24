// lib/firebase/server.ts
import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
  // ✅ Use the 3 individual environment variables
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      'Missing Firebase service account credentials. ' +
      'Please set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID'
    );
  }

  return {
    projectId: projectId,
    privateKey: privateKey,
    clientEmail: clientEmail,
  };
}

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert(getServiceAccount()),
  });

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);