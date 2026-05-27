import { auth } from "@/libs/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function ProfileRedirectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    const username = session.user.username;
    if (username) {
      redirect(`/profile/${username}`);
    }
    redirect("/");
  }
  const cookieStore = await cookies();
  const webViewToken = cookieStore.get("mezon_webview_token")?.value;
  if (webViewToken) {
    const payload = decodeJwtPayload(webViewToken);
    const userName = payload?.userName as string | undefined;
    if (userName) {
      redirect(`/profile/${userName}`);
    }
    redirect("/");
  }

  redirect("/login");
}
