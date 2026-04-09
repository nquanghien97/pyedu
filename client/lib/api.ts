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

// Chuyển ApiResponse sang dạng Type hỗ trợ intersection để linh hoạt hơn
export type ApiExtendedResponse<T = unknown, M = object> = ApiResponse<T> & M;

export async function api<T = unknown, M = object>({
  url,
  options = {},
}: {
  url: string;
  options?: RequestInit;
}): Promise<ApiExtendedResponse<T, M>> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    throw new Error('Unauthorized');
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

  const response = await fetch(fullUrl, {
    credentials: 'include',
    ...options,
  });

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to upload');
  }

  return response.json();
}