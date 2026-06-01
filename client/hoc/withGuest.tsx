'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USER_ROLE } from '@/entity/user';
import Cookies from 'js-cookie';

export function withGuest<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithGuest(props: P) {
    const router = useRouter();
    const [status, setStatus] = useState<'checking' | 'guest' | 'redirecting'>('checking');

    useEffect(() => {
      const role = Cookies.get('role') as USER_ROLE | undefined;

      if (role) {
        setStatus('redirecting');
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
        setStatus('guest');
      }
    }, [router]);

    if (status === 'checking') {
      // Hiển thị loading thay vì trắng
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (status === 'redirecting') {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
