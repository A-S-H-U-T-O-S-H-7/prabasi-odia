import { auth, authReady, db } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { Admin, AdminLoginResponse, AdminVerifyResponse } from '@/types/admin';

function clearStaleAdminStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin-auth-storage');
  }
}

async function findActiveAdmin(user: User): Promise<Admin | null> {
  const directSnapshot = await getDoc(doc(db, 'admins', user.uid));
  let adminData: Record<string, any> | null = directSnapshot.exists()
    ? directSnapshot.data()
    : null;
  let adminDocumentId = directSnapshot.id;

  // Support legacy admin records that used a generated document ID.
  if (!adminData && user.email) {
    const legacySnapshot = await getDocs(
      query(
        collection(db, 'admins'),
        where('email', '==', user.email.toLowerCase()),
        limit(1)
      )
    );
    if (!legacySnapshot.empty) {
      adminData = legacySnapshot.docs[0].data();
      adminDocumentId = legacySnapshot.docs[0].id;
    }
  }

  if (!adminData || adminData.status !== 'active') return null;
  if (user.email && String(adminData.email || '').toLowerCase() !== user.email.toLowerCase()) {
    return null;
  }

  // An audit-field update should not prevent an otherwise valid login.
  updateDoc(doc(db, 'admins', adminDocumentId), {
    uid: user.uid,
    lastLoginAt: new Date().toISOString(),
  }).catch((error) => console.error('Failed to update admin login timestamp:', error));

  return { ...adminData, uid: user.uid } as Admin;
}

export const adminAuthService = {
  login: async (email: string, password: string): Promise<AdminLoginResponse> => {
    try {
      await authReady;
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const admin = await findActiveAdmin(credential.user);

      if (!admin) {
        await signOut(auth);
        return { success: false, error: 'Access denied. Your admin account is missing or inactive.' };
      }

      clearStaleAdminStorage();
      return { success: true, admin };
    } catch (error: any) {
      try {
        await signOut(auth);
      } catch {
        // Ignore cleanup failures.
      }

      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'Admin account not found' };
      }
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { success: false, error: 'Invalid email or password' };
      }
      if (error.code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many failed attempts. Please try again later.' };
      }
      if (error.code === 'permission-denied') {
        return { success: false, error: 'Firestore denied access to the admin record.' };
      }

      return { success: false, error: error.message || 'Login failed' };
    }
  },

  verifySession: async (): Promise<AdminVerifyResponse> => {
    try {
      clearStaleAdminStorage();
      await authReady;
      await auth.authStateReady();

      const user = auth.currentUser;
      if (!user) return { success: false };

      const admin = await findActiveAdmin(user);
      if (!admin) {
        await signOut(auth);
        return { success: false };
      }

      return { success: true, admin };
    } catch (error) {
      console.error('Admin authentication verification error:', error);
      return { success: false };
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      await authReady;
      await signOut(auth);
      clearStaleAdminStorage();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      clearStaleAdminStorage();
      return { success: false };
    }
  },
};
