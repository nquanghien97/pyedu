'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USER_ROLE } from '@/entity/user';
import { useAuthStore } from '@/stores/auth.store';

export function withAuth<P extends object>(
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
        // Redirect về trang chủ nếu không có quyền
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    }, [user, router]);

    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
