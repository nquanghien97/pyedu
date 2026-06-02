'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USER_ROLE } from '@/entity/user';
import { useAuthStore } from '@/stores/auth.store';

export function withAuth<P extends { children?: React.ReactNode }>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: USER_ROLE[]
) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (!user) return; // Chờ cho đến khi user được load xong

      const role = user.role;

      if (!allowedRoles.includes(role)) {
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    }, [user, router]);

    // Luôn render layout (sidebar + header) để giữ UI ổn định
    // Khi chưa authorized, thay children bằng loading spinner
    const content = isAuthorized
      ? props.children
      : (
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      );

    return <WrappedComponent {...props} children={content} />;
  };
}
