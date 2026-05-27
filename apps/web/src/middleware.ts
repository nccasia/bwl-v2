import { auth } from "@/libs/auth";
import { type NextRequest, NextResponse } from "next/server";

const MEZON_WEBVIEW_COOKIE = "mezon_webview_token";

export default async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;
  const userId = session?.user?.id;

  const isWebViewAuthenticated =
    !!request.cookies.get(MEZON_WEBVIEW_COOKIE)?.value;

  if (!session && !isWebViewAuthenticated && pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((session || isWebViewAuthenticated) && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && pathname === "/profile" && userId) {
    return NextResponse.redirect(new URL(`/profile/${userId}`, request.url));
  }

  return NextResponse.next();
}
