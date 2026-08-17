import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
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
