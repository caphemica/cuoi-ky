import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import axios from '@/services/axios.customize';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  hasHydrated: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  
  // API Actions
  loginAPI: (email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null,
        hasHydrated: false,

        login: (user, token) => {
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            isLoading: false 
          });
          // Store token in localStorage for axios interceptor
          localStorage.setItem('access_token', token);
        },

        logout: () => {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false 
          });
          localStorage.removeItem('access_token');
        },

        setLoading: (isLoading) => set({ isLoading }),

        updateUser: (userData) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...userData } });
          }
        },

        setHasHydrated: (hasHydrated) => set({ hasHydrated }),

        loginAPI: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            const response = await axios.post('/auth/login', {
              email,
              password
            });
            
            // Axios interceptor đã return response.data, nên response chính là data
            const { access_token } = response as any;
            
            // Lưu token vào localStorage trước
            localStorage.setItem('access_token', access_token);
            
            // Gọi API profile để lấy thông tin user
            const profileResponse = await axios.get('/auth/profile');
            const profileData = profileResponse as any;
            
            const user = {
              id: profileData.userId.toString(),
              name: 'Admin User', // Default name
              email: profileData.email,
              role: 'admin', // Default role
            };
            
            get().login(user, access_token);
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        refreshToken: async () => {
          try {
            const response = await axios.post('/auth/refresh');
            const { token } = response as any;
            const currentUser = get().user;
            if (currentUser) {
              get().login(currentUser, token);
            }
          } catch (error) {
            get().logout();
            throw error;
          }
        },

        refreshUserProfile: async () => {
          try {
            const response = await axios.get('/auth/profile');
            const profileData = response as any;
            
            const currentUser = get().user;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                id: profileData.userId.toString(),
                email: profileData.email,
              };
              get().updateUser(updatedUser);
            }
          } catch (error) {
            console.error('Failed to refresh user profile:', error);
            throw error;
          }
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          user: state.user, 
          token: state.token, 
          isAuthenticated: state.isAuthenticated 
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
          // Restore token to localStorage when hydrating
          if (state?.token) {
            localStorage.setItem('access_token', state.token);
          }
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// App state store
interface AppState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  hasHydrated: boolean;
  
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        sidebarCollapsed: false,
        theme: 'light',
        hasHydrated: false,

        toggleSidebar: () => set((state) => ({ 
          sidebarCollapsed: !state.sidebarCollapsed 
        })),
        
        setTheme: (theme) => set({ theme }),

        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      }),
      {
        name: 'app-storage',
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Hook để check hydration status
export const useHydration = () => {
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const appHydrated = useAppStore((state) => state.hasHydrated);
  
  return authHydrated && appHydrated;
};