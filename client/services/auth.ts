import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
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
    useAuthStore.setState({ user: null, me: null, accessToken: null });
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