import 'server-only';

import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
  const configuredAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();

  if (configuredAccount) {
    if (configuredAccount.startsWith('{')) {
      return JSON.parse(configuredAccount);
    }

    const configuredPath = isAbsolute(configuredAccount)
      ? configuredAccount
      : join(process.cwd(), configuredAccount);

    if (!existsSync(configuredPath)) {
      throw new Error(`Firebase service account file was not found: ${configuredPath}`);
    }

    return JSON.parse(readFileSync(configuredPath, 'utf8'));
  }

  return JSON.parse(
    readFileSync(join(process.cwd(), 'serviceAccountKey.json'), 'utf8')
  );
}

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert(getServiceAccount()),
  });

export const adminDb = getFirestore(adminApp);
