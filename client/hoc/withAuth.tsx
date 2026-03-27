'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USER_ROLE } from '@/entity/user';
import Cookies from 'js-cookie';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: USER_ROLE[]
) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const role = Cookies.get('role') as USER_ROLE;

      if (!role) {
        router.replace('/login');
      } else if (!allowedRoles.includes(role)) {
        // Redirect về trang chủ nếu không có quyền
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    }, [router]);

    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
