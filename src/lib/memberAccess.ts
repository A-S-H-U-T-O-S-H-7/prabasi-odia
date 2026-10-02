import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

/** Require an approved NRI, RI, or Odisha resident account for member actions. */
export async function requireApprovedMember(action: string): Promise<string> {
  const signedIn = auth.currentUser;
  if (!signedIn) throw new Error(`Please sign in to ${action}.`);

  const profile = await getDoc(doc(db, 'users', signedIn.uid));
  const data = profile.data();
  if (!data?.hasJoinedCommunity || data.isVerified !== true || data.residencyStatus === 'GUEST') {
    throw new Error(`Only approved Odia accounts can ${action}.`);
  }
  return signedIn.uid;
}
