'use client';

import { menuSidebarStudent } from "@/constants/menuSidebar";
import Header from "@/layout/header";
import Sidebar from "@/layout/sidebar";
import { useState } from "react";
import { withAuth } from "@/hoc/withAuth";
import { USER_ROLE } from "@/entity/user";

const historyChat = [
  {
    id: '1',
    title: 'Phân tích hàm số và đồ thị'
  },
  {
    id: '2',
    title: 'Giải bài tập xác xuất'
  }
]

function StudentLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      <Header open={open} toggleClick={() => setOpen(!open)} />
      <main className="flex flex-col">
        <div className="flex">
          <Sidebar open={open} toggleClick={() => setOpen(!open)} menu={menuSidebarStudent} historyChat={historyChat} />
          <div className="flex-1 bg-gray-50">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default withAuth(StudentLayout, [USER_ROLE.STUDENT]);