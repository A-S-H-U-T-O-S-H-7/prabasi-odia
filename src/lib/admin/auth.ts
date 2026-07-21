import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Admin, AdminLoginResponse, AdminVerifyResponse } from '@/types/admin';

export const adminAuthService = {
  login: async (email: string, password: string): Promise<AdminLoginResponse> => {
    try {
      
      // Check if admin exists in Firestore
      const adminsRef = collection(db, 'admins');
      const q = query(
        adminsRef,
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);


      if (querySnapshot.empty) {
        return { success: false, error: 'Admin account not found or inactive' };
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data() as Admin;


      // Check password
      if (adminData.password !== password) {
        return { success: false, error: 'Invalid password' };
      }

      // Generate session token
      const sessionToken = `${adminData.uid}-${Date.now()}-${Math.random().toString(36).substring(2)}`;

      // Update last login
      await updateDoc(doc(db, 'admins', adminDoc.id), {
        lastLoginAt: new Date().toISOString(),
      });

      return {
        success: true,
        sessionToken,
        admin: adminData,
      };
    } catch (error: any) {
      console.error('Admin login error:', error);
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
    return { success: true };
  },
};