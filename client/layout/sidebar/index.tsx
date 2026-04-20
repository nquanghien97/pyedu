import {
  MouseEventHandler,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './sidebar.module.css';
import SidebarItem from './sidebarItem';
import { useAuthStore } from '@/stores/auth.store';
import { DataSidebarType } from '@/constants/menuSidebar';
import Link from 'next/link';
import { ChevronRightIcon, EllipsisIcon, LogOutIcon, PencilIcon, SettingsIcon, TrashIcon } from 'lucide-react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { Button } from '@/components/ui/button';
import { logout } from '@/services/auth';
import { useRouter } from 'next/navigation';

interface SidebarProps extends PropsWithChildren {
  open: boolean;
  toggleClick: () => void;
  start?: string;
  end?: string;
  exit?: string;
  menu: DataSidebarType[]
}

type OptionsHistoryState = {
  index: number;
  x: number;
  y: number;
} | null;

function Sidebar(props: SidebarProps) {
  const { open, toggleClick, menu } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpenOptionsHistory, setIsOpenOptionsHistory] = useState<OptionsHistoryState>(null)

  const optionsHistoryRef = useOutsideClick(() => {
    setIsOpenOptionsHistory(null);
  });

  const handleOptionsHistoryClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Không trigger click vào li
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Toggle: nếu đang mở cùng index thì đóng lại
    if (isOpenOptionsHistory?.index === index) {
      setIsOpenOptionsHistory(null);
      return;
    }

    setIsOpenOptionsHistory({
      index,
      x: rect.left, // bên trái button
      y: rect.bottom + 4, // bên dưới button
    });
  };

  const { me, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      if (open) {
        containerRef.current.style.width = '3rem';
      } else {
        containerRef.current.style.width = '16rem';
      }
    }
  }, [open]);

  // if (!me) {
  //   return;
  // }

  const clickHandler: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === containerRef.current) {
      toggleClick();
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/login');
  };

  const width = open ? '3rem' : '16rem';
  return (
    <>
      <div
        className={styles.container}
        ref={containerRef}
        onClick={clickHandler}
      >
        <div className={`${styles.wrapper} p-2`}>
          <div className={styles.sidebar_body}>
            {menu.map(
              (data) => {
                // if (data.allowRole) {
                //   if (Array.isArray(data.allowRole)) {
                //     if (!data.allowRole.includes(me.role)) {
                //       return null;
                //     }
                //   } else {
                //     if (data.allowRole !== me.role) {
                //       return null;
                //     }
                //   }
                // }
                return <SidebarItem key={data.title} menu={data} open={open} />;
              }
            )}
          </div>
          <div className="py-2 border border-transparent border-t-[#ccc]">
            <div className="px-3 py-2">
              <Link
                href="/"
                className="flex gap-2 items-center"
              >
                <SettingsIcon width={20} height={20} />
                {!open && <span className="whitespace-nowrap">Cài đặt</span>}
              </Link>
            </div>
            <div className="px-3 py-2">
              <div
                className="cursor-pointer flex gap-2 items-center text-red-500"
                onClick={handleLogout}
              >
                <LogOutIcon width={20} height={20} />
                {!open && <span className="whitespace-nowrap">Đăng xuất</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={styles.block}
        style={{ '--width': width } as React.CSSProperties}
      />
    </>
  );
}

export default Sidebar;
