import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
        return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }
    const targetUrl = new URL("/api/auth/oauth2/callback/mezon", request.url);
    searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(targetUrl);
}
