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

interface SidebarProps extends PropsWithChildren {
  open: boolean;
  toggleClick: () => void;
  start?: string;
  end?: string;
  exit?: string;
  menu: DataSidebarType[]
  historyChat?: {
    id: string
    title: string
  }[]
}

type OptionsHistoryState = {
  index: number;
  x: number;
  y: number;
} | null;

function Sidebar(props: SidebarProps) {
  const { open, toggleClick, menu, historyChat } = props;

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

  const { me } = useAuthStore();

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
            {(historyChat && historyChat.length !== 0) && (
              <div className="pl-4 mt-2">
                <div className="">
                  <div className="border-2 border-transparent border-l-[#ccc] pl-2 flex justify-between mb-2">
                    <p className="text-[#8d94a0] font-semibold text-sm">Gần đây</p>
                    <div className="flex items-center cursor-pointer">
                      <p className="font-semibold text-sm">Xem tất cả</p>
                      <ChevronRightIcon width={16} height={16} />
                    </div>
                  </div>
                  <ul className="">
                    {historyChat?.map((chat, index) => (
                      <li key={chat.id} className="group text-sm p-2 cursor-pointer hover:bg-[#f1f1f1] duration-300 rounded-md flex justify-between items-center">
                        <p>{chat.title}</p>
                        <EllipsisIcon width={16} height={16} className="text-[#aba9a9] hover:text-[black] duration-300 hidden group-hover:block" onClick={(e) => handleOptionsHistoryClick(e, index)} />
                      </li>
                    ))}
                  </ul>

                  {/* Popup - render ở root level qua fixed positioning */}
                  {isOpenOptionsHistory && (
                    <div
                      ref={optionsHistoryRef}
                      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-35 p-2"
                      style={{ top: isOpenOptionsHistory.y, left: isOpenOptionsHistory.x }}
                    >
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[#f1f1f1] rounded-md cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          // handle rename
                          setIsOpenOptionsHistory(null);
                        }}
                      >
                        <PencilIcon width={14} height={14} />
                        Đổi tên
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#f1f1f1] rounded-md cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          // handle delete
                          setIsOpenOptionsHistory(null);
                        }}
                      >
                        <TrashIcon width={14} height={14} />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
              <Link
                href="/"
                className="flex gap-2 items-center text-red-500"
              >
                <LogOutIcon width={20} height={20} />
                {!open && <span className="whitespace-nowrap">Đăng xuất</span>}
              </Link>
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
