import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * Base URL for the Nexucon backend (Digital Eye / scans endpoints).
 *
 * Resolves the same env var the rest of this app uses, then normalises it:
 * the value may be a bare origin ("http://localhost:8000") or already carry
 * the "/api/v1" prefix — either way API_BASE_URL ends with "/api/v1".
 * Never append "/api/v1" again at a call site — use `apiOrigin()` below when
 * you need the bare server origin (WebSockets, SSE, media URLs).
 */
function resolveBaseUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  const validEnvUrl = envUrl.startsWith('http') ? envUrl : '';
  const fallback = 'https://nexucon-backend.onrender.com';
  let base = (validEnvUrl || fallback).replace(/\/+$/, '');
  if (!/\/api\/v\d+$/.test(base)) base = `${base}/api/v1`;
  return base;
}

export const API_BASE_URL = resolveBaseUrl();

/**
 * Access-token storage keys. The government app writes
 * `nexucon_access_token` on login; `token` is accepted as a fallback so the
 * Digital Eye pages keep working under either convention.
 */
const TOKEN_KEYS = ['nexucon_access_token', 'token'] as const;
const REFRESH_TOKEN_KEYS = ['nexucon_refresh_token', 'refresh_token'] as const;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // The backend enables DRF's BrowsableAPIRenderer; without this an
    // `Accept: text/html` negotiation can return the HTML debug page.
    Accept: 'application/json',
  },
  withCredentials: true,
});

/** Server origin (scheme + host + port) with the `/api/v1` suffix stripped. */
export function apiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    // Relative base (e.g. "/api/v1") — fall back to the browser origin.
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
}

/** Absolute REST URL for `path`, e.g. getApiUrl('/scans/sessions/'). */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * WebSocket URL for a backend path outside the REST prefix.
 * e.g. getWsUrl('/ws/processing/<id>/') -> ws://localhost:8000/ws/processing/<id>/
 */
export function getWsUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiOrigin()}${normalizedPath}`.replace(/^http/, 'ws');
}

function readStorage(keys: readonly string[]): string | null {
  if (typeof window === 'undefined') return null;
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

export function getToken(): string | null {
  return readStorage(TOKEN_KEYS);
}

export function setTokens(access: string, refresh?: string | null): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEYS[0], access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEYS[0], refresh);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  [...TOKEN_KEYS, ...REFRESH_TOKEN_KEYS].forEach((key) =>
    localStorage.removeItem(key)
  );
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set the multipart boundary itself. Several backend
  // endpoints (uploads, defects, thermal anomalies) are multipart-only and
  // reject a hand-set Content-Type.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

/**
 * Single-flight refresh: concurrent 401s share one refresh request instead of
 * each firing their own (the backend rotates refresh tokens, so parallel
 * refreshes would invalidate each other).
 */
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = readStorage(REFRESH_TOKEN_KEYS);
  if (!refresh) throw new Error('No refresh token available');

  // Bare axios: must not go through this instance's interceptors.
  const { data } = await axios.post(
    `${API_BASE_URL}/auth/refresh/`,
    { refresh },
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  // SIMPLE_JWT.ROTATE_REFRESH_TOKENS is on, so a new refresh token comes back
  // on every call and must replace the stored one.
  setTokens(data.access, data.refresh);
  return data.access as string;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as
      | (AxiosRequestConfig & { _retried?: boolean })
      | undefined;

    const isAuthCall =
      typeof config?.url === 'string' && config.url.includes('/auth/');

    if (
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !isAuthCall
    ) {
      config._retried = true;
      try {
        refreshInFlight = refreshInFlight ?? refreshAccessToken();
        const access = await refreshInFlight;
        refreshInFlight = null;
        config.headers = {
          ...(config.headers as Record<string, unknown>),
          Authorization: `Bearer ${access}`,
        } as AxiosRequestConfig['headers'];
        return api.request(config);
      } catch {
        refreshInFlight = null;
        clearTokens();
        if (typeof window !== 'undefined') {
          // Match the app-wide convention: only bounce to the login page when
          // no local session exists.
          const hasSession = localStorage.getItem('nexucon_auth_user');
          if (
            !hasSession &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/accept-invite')
          ) {
            const next = encodeURIComponent(
              window.location.pathname + window.location.search
            );
            window.location.href = `/government/login?next=${next}`;
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Turn an axios failure into a human-readable message.
 *
 * Handles the backend's several error conventions: DRF `{detail}`, the scans
 * app's `{error}`, the StandardResponse envelope, per-field validation maps,
 * and django-ratelimit (which returns 403, not 429).
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }
  const status = error.response?.status;
  const data = error.response?.data as
    | Record<string, unknown>
    | string
    | undefined;

  if (typeof data === 'string' && data && !data.startsWith('<')) return data;

  if (data && typeof data === 'object') {
    const direct = data.error ?? data.detail ?? data.message;
    if (typeof direct === 'string') return direct;

    // StandardResponse envelope: {success, message, data, errors}
    if (typeof data.message === 'string' && data.message) return data.message;

    // Field validation errors: {"field": ["msg", ...]}
    const firstField = Object.entries(data)[0];
    if (firstField) {
      const [field, value] = firstField;
      const msg = Array.isArray(value) ? value[0] : value;
      if (typeof msg === 'string') {
        return field === 'non_field_errors' ? msg : `${field}: ${msg}`;
      }
    }
  }

  if (status === 403) {
    return 'Request refused (permission denied, or the endpoint rate limit was exceeded). Please wait a moment and retry.';
  }
  if (status === 404) return 'Not found.';
  if (status === 415) return 'Unsupported payload format for this endpoint.';
  if (status === 502 || status === 503) {
    return 'The backend is unavailable. Check that the Django server is running.';
  }
  if (error.code === 'ERR_NETWORK') {
    return `Cannot reach the backend at ${API_BASE_URL}. Is the Django server running?`;
  }
  return error.message || fallback;
}

/** Fire a toast via the global listener mounted in the dashboard layout. */
export function notify(
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('show-toast', { detail: { message, type } })
  );
}

export default api;
