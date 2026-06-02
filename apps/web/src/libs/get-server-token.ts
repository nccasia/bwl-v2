import type { AuthUser } from "@/libs/auth";

const MEZON_WEBVIEW_COOKIE = "mezon_webview_token";

function getAccessTokenFromUser(
  user: AuthUser | undefined,
): string | undefined {
  return user?.accessToken;
}

export async function getServerAccessToken(): Promise<string | undefined> {
  const { cookies, headers } = await import("next/headers");
  const [cookieStore, requestHeaders] = await Promise.all([
    cookies(),
    headers(),
  ]);

  const { auth } = await import("@/libs/auth");
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  const sessionToken = getAccessTokenFromUser(
    session?.user as AuthUser | undefined,
  );
  if (sessionToken) {
    return sessionToken;
  }

  return cookieStore.get(MEZON_WEBVIEW_COOKIE)?.value ?? undefined;
}
