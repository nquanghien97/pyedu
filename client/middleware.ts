import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLE } from "./entity/user";

export default function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  // const hasRefreshToken = req.cookies.has("refreshToken");

  const { pathname } = req.nextUrl;

  // Nếu có role cookie nhưng không còn refreshToken → session đã hết hạn
  // Xóa role cookie cũ và coi như chưa đăng nhập
  // if (role && !hasRefreshToken) {
  //   const isDashboard =
  //     pathname.startsWith("/student") ||
  //     pathname.startsWith("/teacher") ||
  //     pathname.startsWith("/admin");
  //   const response = isDashboard
  //     ? NextResponse.redirect(new URL("/login", req.url))
  //     : NextResponse.next();
  //   response.cookies.delete("role");
  //   return response;
  // }

  // Nếu chưa login mà vào dashboard
  if (!role && (
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin")
  )) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Đã login nhưng lại cố truy cập vào trang login/register -> đẩy về dashboard
  if (role && (pathname === "/login" || pathname === "/register")) {
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