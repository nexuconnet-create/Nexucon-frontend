import axios from 'axios';

export function getBackendUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  const validEnvUrl = envUrl.startsWith('http') ? envUrl : '';
  const fallback = 'https://api.nexucon.net';
  return (validEnvUrl || fallback).replace(/\/+$/, '');
}

export const backendUrl = getBackendUrl();
let base = backendUrl;
if (!/\/api\/v\d+$/.test(base)) base = `${base}/api/v1`;

const api = axios.create({
  baseURL: base,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    if (config.url) {
      const [pathname, search] = config.url.split('?');
      const normalizedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
      config.url = search !== undefined ? `${normalizedPath}?${search}` : normalizedPath;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (typeof (config.headers as any)?.delete === 'function') {
        (config.headers as any).delete('Content-Type');
      }
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexucon_access_token');
      if (token) {
        if (typeof (config.headers as any)?.set === 'function') {
          (config.headers as any).set('Authorization', `Bearer ${token}`);
        } else {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to unwrap the StandardResponse
api.interceptors.response.use(
  (response) => {
    // If the backend returns a StandardResponse, unwrap it to return the 'data' payload
    if (response.data && (response.data.status === 'success' || response.data.success === true) && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Only redirect to login if no local session exists and explicitly 401
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const hasSession = localStorage.getItem('nexucon_auth_user');
        const token = localStorage.getItem('nexucon_access_token');
        if (!token && !hasSession && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/accept-invite')) {
          window.location.href = '/government/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
