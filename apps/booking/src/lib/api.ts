/**
 * ==============================================================================
 * CENTRALIZED API CLIENT (REST / Fetch Wrapper)
 * ==============================================================================
 * Simplifies HTTP requests (GET, POST, PUT, PATCH, DELETE) to the backend.
 * Automatically extracts JWT token from localStorage and attaches `Authorization: Bearer <token>`
 * to all outgoing requests.
 */

// Base API URL: Defaults to local Express server running on port 5001
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

/**
 * Generic request helper with error handling and JSON parsing.
 */
async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers = {}, ...customConfig } = options;
  const token = localStorage.getItem('token');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // If user is authenticated, attach the JWT token to header
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, config);

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = responseData?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return responseData;
}

// Exported shorthand methods
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'POST', data, ...options }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PUT', data, ...options }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PATCH', data, ...options }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
