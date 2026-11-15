/* antislop: Resilient API client for ORBITA NOVA Mission Control Backend (Team Certified Space Cap) */

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : '/api';

export interface UserProfile {
  id: string;
  email: string;
  callsign: string | null;
  avatar_url: string | null;
  auth_provider: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  error?: string;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('orbita:token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('orbita:token', token);
      } else {
        localStorage.removeItem('orbita:token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('orbita:token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data as T;
    } catch (err: any) {
      console.warn(`[API] Server unavailable at ${url}, falling back to local simulation mode:`, err.message);
      // Fallback handlers if backend server is not running
      return this.handleLocalFallback<T>(endpoint, options);
    }
  }

  /**
   * Resilient local fallback mode if backend server is offline or static hosting
   */
  private handleLocalFallback<T>(endpoint: string, options: RequestInit): T {
    const body = options.body ? JSON.parse(options.body as string) : {};

    if (endpoint === '/auth/login') {
      const email = body.email || 'explorer@nasa.gov';
      const storedUsers = JSON.parse(localStorage.getItem('orbita:mock_users') || '{}');
      const user = storedUsers[email] || {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        callsign: null,
        avatar_url: null,
        auth_provider: 'local',
        role: 'cadet',
      };
      const token = 'sim_tok_' + Math.random().toString(36).substring(2, 15);
      this.setToken(token);
      return { success: true, token, user } as unknown as T;
    }

    if (endpoint === '/auth/register') {
      const email = body.email;
      const user = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        callsign: null,
        avatar_url: null,
        auth_provider: 'local',
        role: 'cadet',
      };
      const storedUsers = JSON.parse(localStorage.getItem('orbita:mock_users') || '{}');
      storedUsers[email] = user;
      localStorage.setItem('orbita:mock_users', JSON.stringify(storedUsers));
      const token = 'sim_tok_' + Math.random().toString(36).substring(2, 15);
      this.setToken(token);
      return { success: true, token, user } as unknown as T;
    }

    if (endpoint === '/auth/google') {
      const email = body.email || 'cadet.google@nasa.gov';
      const user = {
        id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
        email,
        callsign: null,
        avatar_url: body.avatarUrl || null,
        auth_provider: 'google',
        role: 'cadet',
      };
      const token = 'sim_g_tok_' + Math.random().toString(36).substring(2, 15);
      this.setToken(token);
      return { success: true, token, user } as unknown as T;
    }

    if (endpoint === '/auth/me') {
      const token = this.getToken();
      if (!token) return { success: false, error: 'No active session' } as unknown as T;
      const savedUser = localStorage.getItem('orbita:active_user');
      if (savedUser) {
        return { success: true, user: JSON.parse(savedUser) } as unknown as T;
      }
      return {
        success: true,
        user: {
          id: 'usr_default',
          email: 'pilot@orbita.nasa',
          callsign: null,
          avatar_url: null,
          auth_provider: 'local',
          role: 'cadet',
        }
      } as unknown as T;
    }

    if (endpoint === '/user/callsign') {
      const callsign = (body.callsign || '').toUpperCase();
      const savedUser = localStorage.getItem('orbita:active_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        u.callsign = callsign;
        localStorage.setItem('orbita:active_user', JSON.stringify(u));
      }
      return { success: true, callsign, message: 'Callsign tersimpan.' } as unknown as T;
    }

    return { success: true } as unknown as T;
  }

  // Auth Methods
  async login(email: string, password: string):Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.token && res.user) {
      this.setToken(res.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbita:active_user', JSON.stringify(res.user));
      }
    }
    return res;
  }

  async register(email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirmPassword }),
    });
    if (res.success && res.token && res.user) {
      this.setToken(res.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbita:active_user', JSON.stringify(res.user));
      }
    }
    return res;
  }

  async loginWithGoogle(profile: { email: string; name?: string; avatarUrl?: string; googleId: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
    if (res.success && res.token && res.user) {
      this.setToken(res.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbita:active_user', JSON.stringify(res.user));
      }
    }
    return res;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const res = await this.request<{ success: boolean; user?: UserProfile }>('/auth/me', {
      method: 'GET',
    });
    if (res.success && res.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbita:active_user', JSON.stringify(res.user));
      }
      return res.user;
    }
    return null;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {}
    this.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orbita:active_user');
      localStorage.removeItem('orbita:token');
    }
  }

  async updateCallsign(callsign: string): Promise<{ success: boolean; callsign?: string; error?: string }> {
    const res = await this.request<{ success: boolean; callsign?: string; error?: string }>('/user/callsign', {
      method: 'POST',
      body: JSON.stringify({ callsign }),
    });
    if (res.success && res.callsign && typeof window !== 'undefined') {
      const saved = localStorage.getItem('orbita:active_user');
      if (saved) {
        const u = JSON.parse(saved);
        u.callsign = res.callsign;
        localStorage.setItem('orbita:active_user', JSON.stringify(u));
      }
    }
    return res;
  }
}

export const api = new ApiService();
