"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  role_name: string | null;
  agency_code: string | null;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
  completeOnboarding: (onboardingData?: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isProd = process.env.NODE_ENV === 'production';
const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
const validEnvUrl = envUrl.startsWith('http') ? envUrl : null;
const backendUrl = (validEnvUrl || 'http://127.0.0.1:8000').replace(/\/$/, '');
const API_BASE_URL = `${backendUrl}/api/v1`;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleSetUser = (userData: User | null) => {
    if (userData) {
      const role = userData.role_name || 'Agency Head';
      const perms = Array.isArray(userData.permissions) && userData.permissions.length > 0
        ? userData.permissions
        : [
            'admin',
            'projects.view',
            'projects.create',
            'projects.edit',
            'projects.delete',
            'applications.view',
            'applications.create',
            'applications.approve',
            'applications.reject',
            'inspections.view',
            'inspections.create',
            'inspections.update',
            'inspections.delete',
            'analytics.view_industry',
            'all.delete',
          ];
      const fullUser: User = {
        ...userData,
        role_name: role,
        permissions: perms,
      };
      setUser(fullUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexucon_auth_user', JSON.stringify(fullUser));
      }
    } else {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nexucon_auth_user');
        localStorage.removeItem('nexucon_access_token');
      }
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexucon_access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const refreshUser = async () => {
    let hasToken = false;
    let hasCached = false;
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexucon_access_token');
      hasToken = !!token;
      const cached = localStorage.getItem('nexucon_auth_user');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) {
            setUser(parsed);
            hasCached = true;
          }
        } catch {
          // ignore corrupted cache
        }
      }
    }

    // Do not make speculative unauthenticated calls to /auth/me/ on public pages
    if (!hasToken && !hasCached) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me/`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data && data.data) {
            handleSetUser(data.data);
          }
        }
      } else if (res.status === 401) {
        // Stale or expired token; clean up state silently
        handleSetUser(null);
      }
    } catch (err) {
      console.warn('Network sync for user session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    const email = credentials.email?.trim().toLowerCase();
    const password = credentials.password;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.data?.access && typeof window !== 'undefined') {
            localStorage.setItem('nexucon_access_token', data.data.access);
          }
          handleSetUser(data.data.user);
          return true;
        }
      }
    } catch (err: any) {
      console.warn('Remote login attempt notice:', err);
    }

    // Fallback: Check for invited/onboarded user credentials saved on this device
    if (typeof window !== 'undefined' && email) {
      const storedCredsStr = localStorage.getItem(`nexucon_user_credentials_${email}`);
      if (storedCredsStr) {
        try {
          const storedCreds = JSON.parse(storedCredsStr);
          if (storedCreds.password === password) {
            const userObj: User = {
              id: storedCreds.id || `usr-${Date.now()}`,
              email: storedCreds.email,
              first_name: storedCreds.first_name || storedCreds.name?.split(' ')[0] || 'Government',
              last_name: storedCreds.last_name || storedCreds.name?.split(' ')[1] || 'Official',
              is_verified: true,
              role_name: storedCreds.role_name || storedCreds.role || 'Government Agency Head',
              agency_code: 'LASBCA',
              permissions: [
                'admin',
                'projects.view',
                'projects.create',
                'projects.edit',
                'applications.view',
                'applications.create',
                'applications.approve',
                'inspections.view',
                'inspections.create',
                'inspections.update',
                'monitoring.view',
                'analytics.view_industry'
              ]
            };
            handleSetUser(userObj);
            setIsLoading(false);
            return true;
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    setError('Invalid email or password. Please check your credentials.');
    setIsLoading(false);
    return false;
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.data?.access && typeof window !== 'undefined') {
            localStorage.setItem('nexucon_access_token', data.data.access);
          }
          if (data.data?.user) {
            handleSetUser(data.data.user);
          }
          return true;
        } else {
          let errorMsg = data.message || 'Registration failed';
          if (data.errors && typeof data.errors === 'object') {
            const firstKey = Object.keys(data.errors)[0];
            const firstErr = data.errors[firstKey];
            if (Array.isArray(firstErr) && firstErr.length > 0) {
              errorMsg = firstErr[0];
            } else if (typeof firstErr === 'string') {
              errorMsg = firstErr;
            }
          }
          setError(errorMsg);
          return false;
        }
      }
      setError('Server returned an unexpected response');
      return false;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.data?.access && typeof window !== 'undefined') {
            localStorage.setItem('nexucon_access_token', data.data.access);
          }
          if (data.data?.user) {
            handleSetUser(data.data.user);
          }
          return true;
        } else {
          setError(data.message || 'Verification failed. Please check your 6-digit code.');
          return false;
        }
      }
      setError('Server returned an unexpected response');
      return false;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during verification');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-verification/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success) {
          return {
            success: true,
            message: data.message || 'A new 6-digit verification code has been sent.',
          };
        } else {
          return {
            success: false,
            message: data.message || 'Failed to resend verification code.',
          };
        }
      }
      return { success: false, message: 'Server returned an unexpected response.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while resending code.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout request completed locally:', err);
    }
    handleSetUser(null);
    router.push('/government/login');
  };

  const completeOnboarding = async (onboardingData: any = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/onboarding/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify(onboardingData),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setError('Server returned an unexpected response');
        return false;
      }
      const data = await res.json();

      if (res.ok && data.success) {
        handleSetUser(data.data);
        return true;
      } else {
        setError(data.message || 'Onboarding failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    if (!user) return true;
    const role = (user.role_name || '').toLowerCase().trim();
    if (
      !role ||
      role === 'agency head' ||
      role === 'agency_head' ||
      role === 'agency-head' ||
      role === 'director' ||
      role === 'admin' ||
      role === 'superadmin' ||
      role === 'agency officer' ||
      user.permissions?.includes('admin') ||
      user.permissions?.includes('*')
    ) {
      return true;
    }
    return user.permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        logout,
        hasPermission,
        refreshUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
