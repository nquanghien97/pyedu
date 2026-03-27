'use client'

import { menuSidebarTeacher } from "@/constants/menuSidebar";
import Header from "@/layout/header";
import Sidebar from "@/layout/sidebar";
import { useState } from "react";
import { withAuth } from "@/hoc/withAuth";
import { USER_ROLE } from "@/entity/user";

function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      <Header open={open} toggleClick={() => setOpen(!open)} />
      <main className="flex flex-col">
        <div className="h-[calc(100vh-68px)] flex">
          <Sidebar open={open} toggleClick={() => setOpen(!open)} menu={menuSidebarTeacher} />
          <div className="flex-1 p-4 bg-gray-50">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default withAuth(TeacherLayout, [USER_ROLE.TEACHER]);