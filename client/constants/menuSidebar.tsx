import { USER_ROLE } from "@/entity/user";
import { AtomIcon, BookOpenIcon, FileChartColumn, LayoutDashboard, NotepadText, User, Users, } from "lucide-react";


export interface DataSidebarType {
  title: string;
  url: string;
  icon?: React.ReactNode;
  items?: DataSidebarType[];
  allowRole: USER_ROLE | USER_ROLE[];
}

export const menuSidebarTeacher = [
  {
    title: 'Tổng quan',
    url: '/teacher',
    icon: <LayoutDashboard width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
  },
  {
    title: 'Lớp học',
    url: '/teacher/classes',
    icon: <Users width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
  },
  {
    title: 'Môn học',
    url: '/teacher/subjects',
    icon: <BookOpenIcon width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
  },
  {
    title: 'Bài tập',
    url: '#',
    icon: <NotepadText width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
    items: [
      {
        title: 'Ngân hàng bài tập',
        url: '/teacher/exercises',
        allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
      },
      {
        title: 'Quản lý bài tập',
        url: '/teacher/assignments/management',
        allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
      },
      {
        title: 'Giao bài tập',
        url: '/teacher/assignments/assign',
        allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
      },
      {
        title: 'Bài kiểm tra',
        url: '/teacher/assignments/tests',
        allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
      }
    ]
  },
  {
    title: 'Học sinh',
    url: '/teacher/students',
    icon: <User width={16} height={16} />,
    allowRole: USER_ROLE.ADMIN,
  },
  {
    title: 'Báo cáo',
    url: '/teacher/reports',
    icon: <FileChartColumn width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
  },
]

export const menuSidebarStudent: DataSidebarType[] = [
  {
    title: 'Tổng quan',
    url: '/student',
    icon: <LayoutDashboard width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.STUDENT],
  },
  {
    title: 'Bài tập',
    url: '/student/assignments',
    icon: <NotepadText width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.STUDENT],
  },
  {
    title: 'Bài kiểm tra',
    url: '/student/tests',
    icon: <NotepadText width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.STUDENT],
  },
  {
    title: 'Gia sư',
    url: '/student/tutors',
    icon: <User width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.STUDENT],
  },
  {
    title: 'Chat bot AI',
    url: '/student/chat',
    icon: <AtomIcon width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.STUDENT],
  },
  {
    title: 'Báo cáo',
    url: '/student/reports',
    icon: <FileChartColumn width={16} height={16} />,
    allowRole: [USER_ROLE.ADMIN, USER_ROLE.STUDENT],
  },
]