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
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
  completeOnboarding: (onboardingData?: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isProd = process.env.NODE_ENV === 'production';
const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
const validEnvUrl = envUrl.startsWith('http') ? envUrl : null;
const backendUrl = validEnvUrl ? validEnvUrl.replace(/\/$/, '') : (isProd ? 'https://nexucon-backend.onrender.com' : '');

const isBrowser = typeof window !== 'undefined';
const API_BASE_URL = isBrowser ? '/api/proxy' : `${backendUrl}/api/v1`;

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
      setUser({
        ...userData,
        role_name: role,
        permissions: perms,
      });
    } else {
      setUser(null);
    }
  };

  const getAuthHeaders = () => {
    // With HttpOnly cookies, we don't manually send the Authorization header.
    // However, if we still need to send JSON, we just set Content-Type.
    return {
      'Content-Type': 'application/json',
    };
  };

  const refreshUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me/`, {
        headers: getAuthHeaders(),
        credentials: 'include', // Ensure cookies are sent
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          handleSetUser(data.data);
        } else {
          handleSetUser(null);
        }
      } else {
        handleSetUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
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
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setError('Server returned an unexpected response');
        return false;
      }
      const data = await res.json();

      if (res.ok && data.success) {
        // Tokens are set via HttpOnly cookies from the server
        handleSetUser(data.data.user);
        return true;
      } else {
        setError(data.message || 'Login failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
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
      if (!contentType || !contentType.includes("application/json")) {
        setError('Server returned an unexpected response');
        return false;
      }
      const data = await res.json();

      if (res.ok && data.success) {
        // Tokens are set via HttpOnly cookies from the server
        handleSetUser(data.data.user);
        return true;
      } else {
        setError(data.message || 'Registration failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
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
      console.error('Logout request failed:', err);
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
