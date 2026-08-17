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

const API_BASE_URL = '/api/v1';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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
          setUser(data.data);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
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
        setUser(data.data.user);
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
        setUser(data.data.user);
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
    setUser(null);
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
        setUser(data.data);
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
    if (!user) return false;
    // For local testing, if it's admin/superuser, they might have everything.
    // For now we check explicit inclusion.
    return user.permissions.includes(permission);
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
