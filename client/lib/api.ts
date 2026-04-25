import { useAuthStore } from "@/stores/auth.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T = unknown, M = object> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ApiExtendedResponse<T = unknown, M = object> = ApiResponse<T> & M;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const resJson = await response.json();
    const newToken = resJson.data.accessToken;
    
    if (newToken) {
      useAuthStore.getState().setAccessToken(newToken);
      return newToken;
    }
    return null;
  } catch (error) {
    console.error("Refresh token error:", error);
    return null;
  }
}

export async function api<T = unknown, M = object>({
  url,
  options = {},
}: {
  url: string;
  options?: RequestInit;
}): Promise<ApiExtendedResponse<T, M>> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const { accessToken } = useAuthStore.getState();

  const requestOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  };

  const response = await fetch(fullUrl, requestOptions);

  if (response.status === 401) {
    // Nếu request này chính là request refresh token thì ko retry nữa để tránh lặp vô tận
    if (url.includes('/api/v1/auth/refresh')) {
       throw new Error('Unauthorized');
    }

    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      
      if (newToken) {
        onTokenRefreshed(newToken);
        // Retry current request
        return api({ url, options });
      } else {
        // Refresh thất bại -> xóa session
        useAuthStore.getState().setAccessToken(null);
        useAuthStore.getState().setUser(null);
        
        // Gọi logout API để server xóa cookie
        try {
          await fetch(`${API_BASE_URL}/api/v1/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) {}

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }
    }

    // Nếu đang refresh, chờ token mới
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(api({ 
            url, 
            options: {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                }
            } 
        }));
      });
    });
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to fetch API data');
  }

  return response.json();
}

export async function apiFormData<T = unknown>({
  url,
  options = {},
}: {
  url: string;
  options?: RequestInit;
}): Promise<ApiResponse<T>> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(fullUrl, {
    credentials: 'include',
    ...options,
    headers: {
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
    }
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
        return apiFormData({ url, options });
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to upload');
  }

  return response.json();
}