import { auth, authReady } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Admin, AdminLoginResponse, AdminVerifyResponse } from '@/types/admin';

function clearStaleAdminStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('admin-auth-storage');
}

export const adminAuthService = {
  login: async (email: string, password: string): Promise<AdminLoginResponse> => {
    try {
      await authReady;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken(true);

      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ idToken }),
      });
      const result = (await response.json()) as AdminLoginResponse;

      if (!response.ok || !result.success) {
        await signOut(auth);
        return { success: false, error: result.error || 'Access denied. You are not an admin.' };
      }

      clearStaleAdminStorage();
      return { success: true, admin: result.admin as Admin };
    } catch (error: any) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }

      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'Admin account not found' };
      }
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { success: false, error: 'Invalid password' };
      }
      if (error.code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many failed attempts. Please try again later.' };
      }

      return { success: false, error: error.message || 'Login failed' };
    }
  },

  verifySession: async (): Promise<AdminVerifyResponse> => {
    try {
      clearStaleAdminStorage();

      const response = await fetch('/api/admin/session', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const result = (await response.json()) as AdminVerifyResponse;

      if (!response.ok || !result.success || !result.admin) {
        return { success: false };
      }

      return { success: true, admin: result.admin };
    } catch (error) {
      console.error('Session verification error:', error);
      return { success: false };
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      await fetch('/api/admin/session', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
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
