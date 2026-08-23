// lib/firebase/server.ts
import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
  const configuredAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();

  if (!configuredAccount) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. ' +
      'Please add it in Vercel or your .env.local file.'
    );
  }

  try {
    if (configuredAccount.startsWith('{')) {
      const parsed = JSON.parse(configuredAccount);
      
      // Validate required fields
      if (!parsed.private_key || !parsed.client_email || !parsed.project_id) {
        throw new Error('Service account is missing required fields: private_key, client_email, or project_id');
      }
      
      console.log("✅ Service account loaded from environment variable");
      console.log(`📱 Project ID: ${parsed.project_id}`);
      return parsed;
    }

    throw new Error('Service account must be a valid JSON string');
  } catch (error) {
    console.error('❌ Error loading service account:', error);
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${error}`);
  }
}

let adminApp;

try {
  const serviceAccount = getServiceAccount();
  
  adminApp = getApps()[0] ?? initializeApp({
    credential: cert(serviceAccount),
  });
  
  console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", error);
  throw error;
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);