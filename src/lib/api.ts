/**
 * kelem-api client — lightweight and robust fetch wrapper for Djoser JWT authentication.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  father_name: string;
  grandfather_name: string;
  phone_number: string;
  address: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JWTResponse {
  access: string;
  refresh: string;
}

export const tokenManager = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('branch_admin_access_token');
  },
  setAccessToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('branch_admin_access_token', token);
    }
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('branch_admin_refresh_token');
  },
  setRefreshToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('branch_admin_refresh_token', token);
    }
  },
  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('branch_admin_access_token');
      localStorage.removeItem('branch_admin_refresh_token');
    }
  }
};

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = tokenManager.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errData: any;
    try {
      errData = await response.json();
    } catch {
      try {
        errData = await response.text();
      } catch {
        errData = null;
      }
    }

    // Try automatic token refresh once on 401 Unauthorized
    if (response.status === 401 && !skipAuth) {
      const refresh = tokenManager.getRefreshToken();
      if (refresh) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/jwt/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json() as { access: string };
            tokenManager.setAccessToken(data.access);
            
            // Retry the request with the new access token
            headers.set('Authorization', `Bearer ${data.access}`);
            const retryResponse = await fetch(url, { ...fetchOptions, headers });
            
            if (retryResponse.ok) {
              return await retryResponse.json() as T;
            }
          }
        } catch {
          // If refresh fails, let it clear and throw
        }
      }
      tokenManager.clearTokens();
    }

    throw new ApiError(
      errData?.detail || errData?.message || `API request failed with status ${response.status}`,
      response.status,
      errData
    );
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json() as T;
  }
  return null as unknown as T;
}

export const authApi = {
  async login(email: string, password: string): Promise<JWTResponse> {
    const res = await request<JWTResponse>('/auth/jwt/create/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true);
    
    tokenManager.setAccessToken(res.access);
    tokenManager.setRefreshToken(res.refresh);
    return res;
  },

  async getCurrentUser(): Promise<ApiUser> {
    return await request<ApiUser>('/api/users/me/', {
      method: 'GET',
    });
  },

  async completeInvitation(uid: string, token: string, newPassword: string): Promise<{ message: string }> {
    return await request<{ message: string }>('/api/branch-admins/complete-invitation/', {
      method: 'POST',
      body: JSON.stringify({ uid, token, new_password: newPassword }),
    }, true);
  },

  logout() {
    tokenManager.clearTokens();
  }
};
