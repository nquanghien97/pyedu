import { api } from '@/lib/api';

export async function getMe() {
  const res = await api({
    url: '/api/v1/users/me',
    options: {
      method: 'GET',
    },
  });
  return res;
}