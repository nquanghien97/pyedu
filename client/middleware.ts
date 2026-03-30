import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLE } from "./entity/user";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const role = req.cookies.get("role")?.value;

  const { pathname } = req.nextUrl;

  // Nếu chưa login mà vào dashboard
  if (!token && (
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin")
  )) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Đã login nhưng lại cố truy cập vào trang login/register -> đẩy về dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    if (role === USER_ROLE.TEACHER) return NextResponse.redirect(new URL("/teacher", req.url));
    if (role === USER_ROLE.STUDENT) return NextResponse.redirect(new URL("/student", req.url));
    if (role === USER_ROLE.ADMIN) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check role: Nếu sai quyền (ví dụ TEACHER vào /student), đẩy về trang chủ '/' thay vì trang login
  if (pathname.startsWith("/admin") && role !== USER_ROLE.ADMIN) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/teacher") && role !== USER_ROLE.TEACHER) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/student") && role !== USER_ROLE.STUDENT) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/chat-sesstion"
  ],
};