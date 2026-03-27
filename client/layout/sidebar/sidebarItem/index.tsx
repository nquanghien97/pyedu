"use client";

import { useState } from "react";
import ArrowRight from "@/assets/icons/ArrowRight";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { DataSidebarType } from "@/constants/menuSidebar";
import { DotIcon } from "lucide-react";

interface SidebarItemProps {
  menu: DataSidebarType;
  open?: boolean;
}

function SidebarItem(props: SidebarItemProps) {
  const pathname = usePathname();
  const { menu, open } = props;

  const [manualOpen, setManualOpen] = useState(false);

  const isActivePath = (menu: DataSidebarType): boolean => {
    if (menu.url === pathname) return true;
    if (menu.items) {
      return menu.items.some((item) => isActivePath(item));
    }
    return false;
  };

  const autoOpen = isActivePath(menu);

  const showChildren = manualOpen || autoOpen;

  const activeClass = pathname === menu.url;

  const handleClick = (e: React.MouseEvent) => {
    if (menu.items) {
      e.preventDefault();
      setManualOpen((prev) => !prev);
    }
  };

  return (
    <>
      <Link href={menu.url} className="w-full">
        <div className={`flex flex-col items-start p-2 rounded-xl hover:bg-[#ebf2fe] ${activeClass && 'bg-[#ebf2fe]'}`}>
          {menu.items ? (
            <div className="flex items-center w-full gap-2 cursor-pointer" onClick={handleClick}>
              <div
                className={`flex items-center w-full gap-2 ${activeClass ? "text-[#1a73e8]!" : "text-black"}`}
              >
                {menu.icon}
                {!open && <span className={`${activeClass} whitespace-nowrap`}>{menu.title}</span>}
              </div>

              {!open && (
                <ArrowRight
                  width={20}
                  height={20}
                  className={`${showChildren ? "rotate-90" : ""} duration-300`}
                />
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center w-full gap-2 text-black">
                <div className={`flex items-center w-full ${menu.icon ? 'gap-2' : 'gap-0'} ${activeClass ? "text-[#1a73e8]!" : "text-black"}`}>
                  {menu.icon || <DotIcon width={24} height={24} />}
                  {!open && <span className={`${activeClass} whitespace-nowrap`}>{menu.title}</span>}
                </div>
              </div>
            </div>
          )}

        </div>
      </Link>
      {showChildren && !open && menu.items && (
        <div className="flex flex-col pl-2 w-full">
          {menu.items.map((item) => (
            <SidebarItem key={item.title} menu={item} />
          ))}
        </div>
      )}</>
  );
}

export default SidebarItem;