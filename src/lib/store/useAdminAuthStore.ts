import { create } from 'zustand';
import { adminAuthService } from '@/lib/admin/auth';
import { Admin } from '@/types/admin';

interface AdminAuthState {
  admin: Admin | null;
  sessionToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifySession: () => Promise<{ success: boolean }>;
  adminLogout: () => Promise<{ success: boolean }>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const loggedOutState = {
  admin: null as Admin | null,
  sessionToken: null as string | null,
  isAuthenticated: false,
  loading: false,
};

const useAdminAuthStore = create<AdminAuthState>()((set) => ({
  admin: null,
  sessionToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  adminLogin: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      const result = await adminAuthService.login(email, password);

      if (result.success && result.admin) {
        set({
          admin: result.admin,
          sessionToken: null,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return { success: true };
      }

      set({
        error: result.error || 'Login failed',
        ...loggedOutState,
      });
      return { success: false, error: result.error || 'Login failed' };
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        ...loggedOutState,
      });
      return { success: false, error: error.message };
    }
  },

  verifySession: async () => {
    set({ loading: true });

    try {
      const result = await adminAuthService.verifySession();

      if (result.success && result.admin) {
        set({
          admin: result.admin,
          sessionToken: null,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return { success: true };
      }

      set(loggedOutState);
      return { success: false };
    } catch {
      set(loggedOutState);
      return { success: false };
    }
  },

  adminLogout: async () => {
    await adminAuthService.logout();
    set({
      ...loggedOutState,
      error: null,
    });
    return { success: true };
  },

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ loading }),
}));

export default useAdminAuthStore;
