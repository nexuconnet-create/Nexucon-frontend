import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
const validEnvUrl = envUrl.startsWith('http') ? envUrl : null;
const backendUrl = validEnvUrl ? validEnvUrl.replace(/\/$/, '') : (isProd ? 'https://nexucon-backend.onrender.com' : '');

const isBrowser = typeof window !== 'undefined';
const api = axios.create({
  baseURL: isBrowser ? '/api/proxy' : `${backendUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // No longer attaching Bearer token from localStorage
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
    // Handle specific error codes if necessary (e.g. 401 redirect to login)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Prevent infinite redirect loop if already on a login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/government/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
