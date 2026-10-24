export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper to retrieve currently authenticated session JWT token
 */
export function getAuthToken() {
  return localStorage.getItem('tracktitans_token') || '';
}

/**
 * Standardized HTTP request wrapper with automatic Bearer token injection
 */
export async function apiRequest(endpoint, { method = 'GET', body, headers = {}, isFormData = false } = {}) {
  const token = await getAuthToken();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders = {
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.errors = data.errors || [];
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API request error on [${method}] ${endpoint}:`, error);
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { method: 'POST', body, ...options }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { method: 'PATCH', body, ...options }),
  postFormData: (endpoint, formData, options = {}) =>
    apiRequest(endpoint, { method: 'POST', body: formData, isFormData: true, ...options }),
};

export default apiClient;
