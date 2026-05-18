import { auth } from "@/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const username = session.user.username;
  if (username) {
    redirect(`/profile/${username}`);
  }
  redirect("/");
}
