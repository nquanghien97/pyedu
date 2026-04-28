import { api, ApiResponse } from '@/lib/api';
import { UserEntity } from '@/entity/user';

interface DashboardStats {
  total: number;
  admin: number;
  teacher: number;
  student: number;
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserParams {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
}

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return api<DashboardStats>({
    url: '/api/v1/admin/stats',
  });
}

export async function getUsers(params: GetUsersParams = {}): Promise<ApiResponse<UserEntity[]>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.role) searchParams.set('role', params.role);
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return api<UserEntity[]>({
    url: `/api/v1/admin/users${query ? `?${query}` : ''}`,
  });
}

export async function createUserAdmin(params: CreateUserParams): Promise<ApiResponse<UserEntity>> {
  return api<UserEntity>({
    url: '/api/v1/admin/users',
    options: {
      method: 'POST',
      body: JSON.stringify(params),
    },
  });
}

export async function updateUserAdmin(id: number, params: UpdateUserParams): Promise<ApiResponse<UserEntity>> {
  return api<UserEntity>({
    url: `/api/v1/admin/users/${id}`,
    options: {
      method: 'PUT',
      body: JSON.stringify(params),
    },
  });
}

export async function deleteUserAdmin(id: number): Promise<ApiResponse<null>> {
  return api<null>({
    url: `/api/v1/admin/users/${id}`,
    options: {
      method: 'DELETE',
    },
  });
}
