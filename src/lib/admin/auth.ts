import { db, auth } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { Admin, AdminLoginResponse, AdminVerifyResponse } from '@/types/admin';

export const adminAuthService = {
  login: async (email: string, password: string): Promise<AdminLoginResponse> => {
    try {
      console.log('🔐 Admin login attempt:', email);

      // Step 1: Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Firebase Auth success:', firebaseUser.uid);

      // Step 2: Check if user exists in admins collection
      const adminsRef = collection(db, 'admins');
      const q = query(
        adminsRef, 
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);

      console.log('📄 Admin query results:', querySnapshot.size);

      if (querySnapshot.empty) {
        console.log('❌ Admin not found');
        await signOut(auth);
        return { success: false, error: 'Access denied. You are not an admin.' };
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data() as Admin;
      console.log('✅ Admin found:', adminData.email);

      // Check if admin is active
      if (adminData.status !== 'active') {
        console.log('❌ Admin account is inactive');
        await signOut(auth);
        return { success: false, error: 'Account is inactive. Contact super admin.' };
      }

      // Step 3: Ensure UID matches Firebase Auth UID (for consistency)
      if (adminData.uid !== firebaseUser.uid) {
        await updateDoc(doc(db, 'admins', adminDoc.id), {
          uid: firebaseUser.uid,
        });
      }

      // Step 4: Generate session token
      const sessionToken = `${firebaseUser.uid}-${Date.now()}-${Math.random().toString(36).substring(2)}`;

      // Step 5: Update last login
      await updateDoc(doc(db, 'admins', adminDoc.id), {
        lastLoginAt: new Date().toISOString(),
      });

      return {
        success: true,
        sessionToken,
        admin: {
          ...adminData,
          uid: firebaseUser.uid,
        },
      };
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      // Handle Firebase Auth errors
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'Admin account not found' };
      }
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'Invalid password' };
      }
      if (error.code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many failed attempts. Please try again later.' };
      }
      
      // Handle Firestore permission errors
      if (error.message?.includes('Missing or insufficient permissions')) {
        return { success: false, error: 'Permission denied. Please contact super admin.' };
      }
      
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  verifySession: async (token: string): Promise<AdminVerifyResponse> => {
    try {
      if (!token) {
        return { success: false };
      }

      const uid = token.split('-')[0];

      const adminsRef = collection(db, 'admins');
      const q = query(
        adminsRef,
        where('uid', '==', uid),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false };
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data() as Admin;

      return {
        success: true,
        admin: adminData,
      };
    } catch (error) {
      console.error('Session verification error:', error);
      return { success: false };
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },
};