import { api } from '@/lib/api';
import Cookies from 'js-cookie';

export async function logout() {
  try {
    await api({
      url: '/api/v1/logout',
      options: { method: 'POST' },
    });
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    Cookies.remove('role');
  }
}

export async function login({ email, password }: { email: string; password: string }) {
  const res = await api({
    url: '/api/v1/login',
    options: {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
  });
  return res;
}