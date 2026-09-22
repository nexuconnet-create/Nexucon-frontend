"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  is_onboarded?: boolean;
  role_name: string | null;
  agency_code: string | null;
  stakeholder_profile?: any;
  phone_number?: string;
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
  logout: (redirectUrl?: string) => Promise<void> | void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
  completeOnboarding: (onboardingData?: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getApiBaseUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  const fallback = 'https://api.nexucon.net';
  let base = (envUrl.startsWith('http') ? envUrl : fallback).replace(/\/+$/, '');
  if (!/\/api\/v\d+$/.test(base)) base = `${base}/api/v1`;
  return base;
}

const API_BASE_URL = getApiBaseUrl();

export const getPortalType = (override?: string): 'stakeholder' | 'inspector' | 'government' | null => {
  if (override) return override.toLowerCase() as any;
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.toLowerCase();
  const host = window.location.hostname.toLowerCase();
  if (path.includes('/stakeholder') || host.startsWith('stakeholder.') || host.includes('stakeholder.localhost') || host.includes('stakeholder-')) {
    return 'stakeholder';
  }
  if (path.includes('/inspector') || host.startsWith('inspector.') || host.includes('inspector.localhost') || host.includes('inspector-')) {
    return 'inspector';
  }
  if (path.includes('/government') || host.startsWith('government.') || host.includes('government.localhost') || host.includes('government-')) {
    return 'government';
  }
  return null;
};

export const isRoleAllowedOnPortal = (roleName: string | undefined | null, portal: 'stakeholder' | 'inspector' | 'government' | null): boolean => {
  if (!portal || !roleName) return true;
  const role = roleName.toLowerCase();
  const isInspector = role.includes('inspector') || role.includes('field officer') || role.includes('site officer') || role.includes('hse') || role.includes('surveillance');
  const isGovernment = !isInspector && (
    role.includes('agency') || role.includes('director') || role.includes('executive') || role.includes('admin') || role.includes('government') || role.includes('ministry') || role.includes('regulator')
  );
  const isStakeholder = !isInspector && !isGovernment;

  if (portal === 'stakeholder') return isStakeholder;
  if (portal === 'inspector') return isInspector;
  if (portal === 'government') return isGovernment;
  return true;
};

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
    const currentPortal = getPortalType();

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexucon_access_token');
      hasToken = !!token;
      const cached = localStorage.getItem('nexucon_auth_user');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) {
            // Check if cached user role matches current portal
            if (currentPortal && !isRoleAllowedOnPortal(parsed.role_name, currentPortal)) {
              console.warn(`[Security] Session role '${parsed.role_name}' is not permitted on '${currentPortal}' portal. Purging cross-portal session.`);
              localStorage.removeItem('nexucon_auth_user');
              localStorage.removeItem('nexucon_access_token');
              setUser(null);
            } else {
              setUser(parsed);
              hasCached = true;
            }
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
            const fetchedRole = data.data.role_name;
            if (currentPortal && !isRoleAllowedOnPortal(fetchedRole, currentPortal)) {
              console.warn(`[Security] /auth/me/ returned role '${fetchedRole}' forbidden on '${currentPortal}'. Invalidating session.`);
              handleSetUser(null);
              if (typeof window !== 'undefined') {
                localStorage.removeItem('nexucon_auth_user');
                localStorage.removeItem('nexucon_access_token');
              }
            } else {
              handleSetUser(data.data);
            }
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

    // Detect target portal from credentials, pathname, or hostname
    const targetPortal = getPortalType(credentials.portal);

    const payload = {
      ...credentials,
      email,
      password,
      portal: targetPortal || undefined,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (targetPortal) {
      headers['X-Portal-Type'] = targetPortal;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        
        if (data && data.requires_activation) {
          setIsLoading(false);
          return { success: false, requiresActivation: true, inviteCode: data.invite_code, message: data.message } as any;
        }

        // Role mismatch error from backend
        if (res.status === 403 || data.code === 'PORTAL_ROLE_MISMATCH') {
          const mismatchMsg = data.detail || data.message || "Access Denied: Your account role cannot log in to this portal.";
          setError(mismatchMsg);
          setIsLoading(false);
          return { success: false, isRoleMismatch: true, message: mismatchMsg, allowedPortal: data.allowed_portal } as any;
        }

        if (res.ok && data.success) {
          const userRole = (data.data?.user?.role_name || '').toLowerCase();

          // Client-side role validation
          if (targetPortal === 'stakeholder') {
            if (userRole.includes('inspector')) {
              const msg = "Access Denied: You are attempting to sign in with an Inspector account. Please log in at the Inspector Terminal (https://inspector.nexucon.net).";
              setError(msg);
              setIsLoading(false);
              return { success: false, isRoleMismatch: true, message: msg, allowedPortal: 'inspector' } as any;
            }
            if (userRole.includes('agency') || userRole.includes('director') || userRole.includes('executive')) {
              const msg = "Access Denied: Government Agency accounts cannot access the Stakeholder portal. Please log in at the Government Command Center (https://government.nexucon.net).";
              setError(msg);
              setIsLoading(false);
              return { success: false, isRoleMismatch: true, message: msg, allowedPortal: 'government' } as any;
            }
          } else if (targetPortal === 'government') {
            if (userRole.includes('stakeholder') || userRole === 'client') {
              const msg = "Access Denied: Stakeholder accounts cannot access the Government Command Center. Please log in at the Stakeholder Portal (https://stakeholder.nexucon.net).";
              setError(msg);
              setIsLoading(false);
              return { success: false, isRoleMismatch: true, message: msg, allowedPortal: 'stakeholder' } as any;
            }
            if (userRole.includes('inspector') && !userRole.includes('head') && !userRole.includes('director')) {
              const msg = "Access Denied: Field Inspector accounts cannot log in to the Government Command Center. Please log in at the Inspector Terminal (https://inspector.nexucon.net).";
              setError(msg);
              setIsLoading(false);
              return { success: false, isRoleMismatch: true, message: msg, allowedPortal: 'inspector' } as any;
            }
          } else if (targetPortal === 'inspector') {
            if (!userRole.includes('inspector')) {
              const msg = "Access Denied: This terminal is strictly for accredited Field Inspectors. Stakeholders and Agency executives must use their respective portals.";
              setError(msg);
              setIsLoading(false);
              return { success: false, isRoleMismatch: true, message: msg } as any;
            }
          }

          if (data.data?.access && typeof window !== 'undefined') {
            localStorage.setItem('nexucon_access_token', data.data.access);
          }
          handleSetUser(data.data.user);
          return true;
        }

        if (data.detail || data.message) {
          setError(data.detail || data.message);
        }
      }
    } catch (err: any) {
      console.warn('Remote login attempt notice:', err);
    }

    // Fallback: Check for invited/onboarded user credentials saved on this device (Strictly portal-aligned)
    if (typeof window !== 'undefined' && email) {
      const storedCredsStr = localStorage.getItem(`nexucon_user_credentials_${email}`);
      if (storedCredsStr) {
        try {
          const storedCreds = JSON.parse(storedCredsStr);
          if (storedCreds.password === password) {
            const rawRole = (storedCreds.role_name || storedCreds.role || '').toLowerCase();
            if (targetPortal === 'stakeholder' && (rawRole.includes('inspector') || rawRole.includes('agency'))) {
              setError("Access Denied: Account role is not permitted on this portal.");
              setIsLoading(false);
              return false;
            }
            if (targetPortal === 'government' && (rawRole.includes('stakeholder') || rawRole.includes('inspector'))) {
              setError("Access Denied: Account role is not permitted on this portal.");
              setIsLoading(false);
              return false;
            }
            if (targetPortal === 'inspector' && !rawRole.includes('inspector')) {
              setError("Access Denied: This terminal is strictly for Field Inspectors.");
              setIsLoading(false);
              return false;
            }

            const userObj: User = {
              id: storedCreds.id || `usr-${Date.now()}`,
              email: storedCreds.email,
              first_name: storedCreds.first_name || storedCreds.name?.split(' ')[0] || 'User',
              last_name: storedCreds.last_name || storedCreds.name?.split(' ')[1] || '',
              is_verified: true,
              role_name: storedCreds.role_name || storedCreds.role || (targetPortal === 'stakeholder' ? 'Client' : 'Agency Officer'),
              agency_code: targetPortal === 'government' ? 'LASBCA' : null,
              permissions: ['*']
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

  const logout = async (customRedirect?: string) => {
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

    let redirectUrl = customRedirect;
    if (!redirectUrl) {
      const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      if (hostname.startsWith('inspector.') || currentPath.startsWith('/inspector')) {
        redirectUrl = '/inspector/login';
      } else if (currentPath.startsWith('/client')) {
        redirectUrl = '/client/login';
      } else if (currentPath.startsWith('/professional')) {
        redirectUrl = '/professional/login';
      } else {
        redirectUrl = '/government/login';
      }
    }

    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    } else {
      router.push(redirectUrl);
    }
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
