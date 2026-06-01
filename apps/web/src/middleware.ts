import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const MEZON_WEBVIEW_COOKIE = "mezon_webview_token";

function isAuthenticated(request: NextRequest) {
  return (
    !!getSessionCookie(request) ||
    !!request.cookies.get(MEZON_WEBVIEW_COOKIE)?.value
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  if (!authenticated && pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|auth/callback|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
