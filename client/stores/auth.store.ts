import { create } from 'zustand';
import Cookies from 'js-cookie';
import { parseJwt } from '@/utils/parseJwt';
import { getMe } from '@/services/user';
import { UserEntity } from '@/entity/user';

interface AuthStoreType {
  user: UserEntity | null;
  getUser: () => void;
  setUser: (
    user: UserEntity | ((prev: UserEntity | null) => UserEntity) | null
  ) => void;
  me: UserEntity | null;
  getMe: () => Promise<void>;
  isRefreshMe: boolean;
  setIsRefreshMe: (isRefreshMe: boolean | ((prev: boolean) => boolean)) => void;
}

export const useAuthStore = create<AuthStoreType>()((set) => ({
  user: null,
  getUser: () => {
    const token = Cookies.get('token');
    const dataParse = parseJwt(token || '');
    set({ user: dataParse?.user || null });
  },
  setUser: (item) =>
    set((state) => ({
      user: typeof item === 'function' ? item(state.user) : item,
    })),
  me: null,
  getMe: async () => {
    try {
      const res = await getMe();
      set({ me: res.data as UserEntity });
    } catch (err) {
      console.log(err);
    }
  },
  isRefreshMe: false,
  setIsRefreshMe: (item) =>
    set((state) => ({
      isRefreshMe: typeof item === 'function' ? item(state.isRefreshMe) : item,
    })),
}));
