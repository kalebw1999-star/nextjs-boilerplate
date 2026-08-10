import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPage = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isAuthApi = pathname.startsWith("/api/auth/");
  const isNextAsset = pathname.startsWith("/_next/") || pathname === "/favicon.ico";

  if (isPublicPage || isAuthApi || isNextAsset) {
    return NextResponse.next();
  }

  const session = request.cookies.get("codiq_session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)).*)",
  ],
};
