import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "codiq_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!session && !isAuthPage && pathname !== "/favicon.ico") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
