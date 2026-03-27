'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USER_ROLE } from '@/entity/user';
import Cookies from 'js-cookie';

export function withGuest<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithGuest(props: P) {
    const router = useRouter();
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
      const role = Cookies.get('role') as USER_ROLE;

      if (role) {
        // Đã login thì redirect về dashboard tương ứng
        if (role === USER_ROLE.TEACHER) {
          router.replace('/teacher');
        } else if (role === USER_ROLE.STUDENT) {
          router.replace('/student');
        } else if (role === USER_ROLE.ADMIN) {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      } else {
        setIsGuest(true);
      }
    }, [router]);

    if (!isGuest) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
