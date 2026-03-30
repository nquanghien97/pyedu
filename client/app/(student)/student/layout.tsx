'use client';

import { menuSidebarStudent } from "@/constants/menuSidebar";
import Header from "@/layout/header";
import Sidebar from "@/layout/sidebar";
import { useState } from "react";
import { withAuth } from "@/hoc/withAuth";
import { USER_ROLE } from "@/entity/user";

function StudentLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      <Header open={open} toggleClick={() => setOpen(!open)} />
      <main className="flex flex-col">
        <div className="flex h-[calc(100vh-68px)]">
          <Sidebar open={open} toggleClick={() => setOpen(!open)} menu={menuSidebarStudent} />
          <div className="flex-1 bg-gray-50">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default withAuth(StudentLayout, [USER_ROLE.STUDENT]);