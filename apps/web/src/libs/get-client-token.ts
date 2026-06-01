const MEZON_WEBVIEW_COOKIE = "mezon_webview_token";

function getCookieToken(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export async function getClientAccessToken(): Promise<string | undefined> {
  const { authClient } = await import("@/libs/auth-client");
  const { data } = await authClient.getSession();
  const sessionToken = (data?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  if (sessionToken) {
    return sessionToken;
  }

  return getCookieToken(MEZON_WEBVIEW_COOKIE) ?? undefined;
}
