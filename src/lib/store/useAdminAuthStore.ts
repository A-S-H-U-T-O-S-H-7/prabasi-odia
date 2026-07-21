import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      sessionToken: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      adminLogin: async (email: string, password: string) => {
        set({ loading: true, error: null });

        try {
          const result = await adminAuthService.login(email, password);

          if (result.success && result.admin && result.sessionToken) {
            set({
              admin: result.admin,
              sessionToken: result.sessionToken,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            // Store in cookie for middleware
            document.cookie = `admin-session=${result.sessionToken}; path=/; max-age=604800; samesite=strict`;
            return { success: true };
          } else {
            set({
              error: result.error || 'Login failed',
              loading: false,
              admin: null,
              sessionToken: null,
              isAuthenticated: false,
            });
            return { success: false, error: result.error || 'Login failed' };
          }
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            loading: false,
            admin: null,
            sessionToken: null,
            isAuthenticated: false,
          });
          return { success: false, error: error.message };
        }
      },

      verifySession: async () => {
        const { sessionToken } = get();

        if (!sessionToken) {
          set({ isAuthenticated: false, admin: null, loading: false });
          return { success: false };
        }

        try {
          const result = await adminAuthService.verifySession(sessionToken);

          if (result.success && result.admin) {
            set({
              admin: result.admin,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return { success: true };
          } else {
            set({
              admin: null,
              sessionToken: null,
              isAuthenticated: false,
              loading: false,
            });
            return { success: false };
          }
        } catch (error) {
          set({
            admin: null,
            sessionToken: null,
            isAuthenticated: false,
            loading: false,
          });
          return { success: false };
        }
      },

      adminLogout: async () => {
        await adminAuthService.logout();
        document.cookie = 'admin-session=; path=/; max-age=0';
        set({
          admin: null,
          sessionToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        return { success: true };
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        admin: state.admin,
        sessionToken: state.sessionToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAdminAuthStore;