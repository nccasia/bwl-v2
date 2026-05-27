import { auth } from "@/libs/auth";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const mezonCookie = request.cookies.get('mezon_token');
  let mezonSession: { userId: string } | null = null;
  if (mezonCookie?.value) {
    try {
      const payload = JSON.parse(mezonCookie.value) as { userId?: string; accessToken?: string };
      if (payload.accessToken && payload.userId) {
        mezonSession = { userId: payload.userId };
      }
    } catch {
      // ignore malformed cookie
    }
  }

  const isLoggedIn = !!(session || mezonSession);
  const userId = session?.user?.id ?? mezonSession?.userId;

  if (!isLoggedIn && pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isLoggedIn && pathname === "/profile" && userId) {
    return NextResponse.redirect(new URL(`/profile/${userId}`, request.url));
  }

  return NextResponse.next();
}
