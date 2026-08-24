import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
const validEnvUrl = envUrl.startsWith('http') ? envUrl : null;
const backendUrl = (validEnvUrl || 'https://nexucon-backend.onrender.com').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${backendUrl}/api/v1`,
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
    if (response.data && response.data.status === 'success' && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Only redirect to login if no local session exists and explicitly 401
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const hasSession = localStorage.getItem('nexucon_auth_user');
        if (!hasSession && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/accept-invite')) {
          window.location.href = '/government/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
