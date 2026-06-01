import { auth } from "@/libs/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const { GET: handleOAuthCallback } = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    const callbackUrl = new URL("/api/auth/oauth2/callback/mezon", request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value);
    });

    try {
        const callbackRequest = new NextRequest(callbackUrl, {
            headers: request.headers,
            method: "GET",
        });

        return await handleOAuthCallback(callbackRequest);
    } catch (error) {
        console.error("OAuth callback failed:", error);
        return NextResponse.redirect(
            new URL("/login?error=oauth_callback_failed", request.url),
        );
    }
}
