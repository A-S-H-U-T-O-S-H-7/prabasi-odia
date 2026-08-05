import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminApp: App | null | undefined;

export function getAdminApp(): App | null {
  if (adminApp !== undefined) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId) {
    adminApp = null;
    return adminApp;
  }

  try {
    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      adminApp = initializeApp({ projectId });
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    adminApp = null;
  }

  return adminApp;
}

export function getAdminFirestore(): Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  return getFirestore(app);
}
