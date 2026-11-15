/* antislop: Authentication Store connecting client state with Mission Control backend */
import { create } from 'zustand';
import { api, type UserProfile } from '../services/api';
import { useMissionStore } from './useMissionStore';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, confirm: string) => Promise<boolean>;
  loginWithGoogle: (profile: { email: string; name?: string; avatarUrl?: string; googleId: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setCallsign: (callsign: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: api.getToken(),
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.getCurrentUser();
      if (user) {
        set({
          user,
          token: api.getToken(),
          isAuthenticated: true,
          isLoading: false,
        });
        if (user.callsign) {
          useMissionStore.getState().setAstronautName(user.callsign);
        }
        return true;
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(email, pass);
      if (res.success && res.user) {
        set({
          user: res.user,
          token: res.token || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        if (res.user.callsign) {
          useMissionStore.getState().setAstronautName(res.user.callsign);
        }
        return true;
      } else {
        set({ isLoading: false, error: res.error || 'Email atau password salah.' });
        return false;
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Gagal terhubung ke server autentikasi.' });
      return false;
    }
  },

  register: async (email: string, pass: string, confirm: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.register(email, pass, confirm);
      if (res.success && res.user) {
        set({
          user: res.user,
          token: res.token || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({ isLoading: false, error: res.error || 'Registrasi gagal.' });
        return false;
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Gagal mendaftar ke server.' });
      return false;
    }
  },

  loginWithGoogle: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.loginWithGoogle(profile);
      if (res.success && res.user) {
        set({
          user: res.user,
          token: res.token || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        if (res.user.callsign) {
          useMissionStore.getState().setAstronautName(res.user.callsign);
        }
        return true;
      } else {
        set({ isLoading: false, error: res.error || 'Gagal masuk dengan Google.' });
        return false;
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Gagal otentikasi Google.' });
      return false;
    }
  },

  setCallsign: async (callsign: string) => {
    try {
      const res = await api.updateCallsign(callsign);
      if (res.success && res.callsign) {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, callsign: res.callsign } });
        }
        useMissionStore.getState().setAstronautName(res.callsign);
        return true;
      }
      return false;
    } catch {
      useMissionStore.getState().setAstronautName(callsign);
      return true;
    }
  },

  logout: async () => {
    await api.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));
