// lib/firebase/server.ts
import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  
  if (!envKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  const parsed = JSON.parse(envKey);
  
  // ✅ Fix: Convert \n to actual newlines for the private key
  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  
  return parsed;
}

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert(getServiceAccount()),
  });

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);