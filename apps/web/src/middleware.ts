import { auth } from "@/libs/auth";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;
  const username = session?.user?.name;

  if (!session && pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && pathname === "/profile" && username) {
    return NextResponse.redirect(new URL(`/profile/${username}`, request.url));
  }

  return NextResponse.next();
}

