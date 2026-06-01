'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { api, refreshAccessToken } from '@/lib/api';
import { usePathname } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setAccessToken, setUser } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Không chạy initAuth trên các trang public để tránh vòng lặp redirect
    const publicPaths = ['/', '/login', '/register'];
    if (publicPaths.includes(pathname)) {
      setIsInitializing(false);
      return;
    }

    const initAuth = async () => {
      setIsInitializing(true);
      try {
        // Nếu chưa có accessToken trong memory (vừa F5), chủ động gọi refresh trước
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) {
          await refreshAccessToken();
        }

        // Sau khi đã thử refresh (thành công hoặc không), mới gọi /me
        const res = await api({ url: '/api/v1/users/me' });
        if (res.success) {
           const userData = res.data as Parameters<typeof setUser>[0];
           setUser(userData);
           useAuthStore.setState({ me: userData as ReturnType<typeof useAuthStore.getState>['me'] });
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [pathname, setAccessToken, setUser]);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

