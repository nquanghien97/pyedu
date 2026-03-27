import UsersIcon from '@/assets/icons/UsersIcon';
import styles from './header.module.css';
import { useState } from 'react';
import ArrowRight from '@/assets/icons/ArrowRight';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { Button } from '@/components/ui/button';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { BellIcon, LockIcon, MenuIcon, UserIcon } from 'lucide-react';
import { logout } from '@/services/auth';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  open: boolean;
  toggleClick: () => void;
}

function Header(props: HeaderProps) {
  const { open, toggleClick } = props;
  const router = useRouter();
  const { me } = useAuthStore();
  const { user, setUser } = useAuthStore();
  const [openUserOptions, setOpenUserOptions] = useState(false);
  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);
  const [isOpenUpdateUser, setIsOpenUpdateUser] = useState(false);

  const userOptionsRef = useOutsideClick(() => {
    setOpenUserOptions(false);
  });

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/login');
  };

  const logoWidth = open ? '3rem' : '16rem';
  return (
    <>
      <header className={styles.container}>
        <div className={styles.left_header}>
          <div
            className={styles.logo_container}
            style={{ '--logo-width': logoWidth } as React.CSSProperties}
          >
            {!open && (
              <Link
                href={`/`}
                className={styles.logo_wrapper}
              >
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={48}
                  height={48}
                />
              </Link>
            )}
            <div className={styles.icon_wrapper} onClick={toggleClick}>
              <MenuIcon width={24} height={24} />
            </div>
          </div>        </div>
        <div className={styles.right_header}>
          <div className="relative">
            <Badge className="absolute -top-3 -right-3 min-w-5 h-5 rounded-full flex items-center justify-center px-1" variant="destructive">12</Badge>
            <BellIcon width={24} height={24} />
          </div>
          <div className={styles.user_wrapper}>
            <div
              className={`${styles.user} gap-2`}
              onClick={() => setOpenUserOptions(true)}
            >
              <div className="flex items-center justify-center rounded-full bg-[#f1f1f1] w-10 h-10 p-2">
                <UserIcon width={24} height={24} />
              </div>
              {/* <span>{user?.username}</span> */}
              <span>Khắc Tuấn</span>
              <ArrowRight
                width={16}
                height={16}
                className={`${openUserOptions && styles.header_item_active} duration-300`}
              />
            </div>
            {openUserOptions && (
              <div className={styles.list_options} ref={userOptionsRef}>
                <div
                  className={styles.option_item}
                  onClick={() => {
                    setIsOpenUpdateUser(true);
                    setOpenUserOptions(false);
                  }}
                >
                  <UsersIcon />
                  <span>Đổi thông tin cá nhân</span>
                </div>
                <div
                  className={styles.option_item}
                  onClick={() => setIsOpenChangePassword(true)}
                >
                  <LockIcon />
                  <span>Đổi mật khẩu</span>
                </div>
                <div className={styles.logout} onClick={() => handleLogout()}>
                  <Button variant="destructive">Đăng xuất</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className={styles.block} />
      {/* <ChangePassword
        open={isOpenChangePassword}
        onClose={() => setIsOpenChangePassword(false)}
      /> */}
      {/* <UpdateUser
        open={isOpenUpdateUser}
        onClose={() => setIsOpenUpdateUser(false)}
        me={user}
      /> */}
    </>
  );
}

export default Header;
