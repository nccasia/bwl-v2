import { ProfilePage } from "@/modules/profile/pages";
import { getServerAccessToken } from "@/libs/get-server-token";
import { getUserById } from "@/services/user/user-service";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getProfileDisplayName(
  identifier: string,
): Promise<string | null> {

  const token = await getServerAccessToken();
  if (!token) {
    return null;
  }

  const user = await getUserById(identifier, token).catch(() => null);
  return user?.userName || user?.name || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: identifier } = await params;
  const t = await getTranslations("profile");
  const displayName = await getProfileDisplayName(identifier);

  if (!displayName) {
    return {
      title: t("pageTitleFallback"),
      description: t("pageDescriptionFallback"),
    };
  }

  return {
    title: t("pageTitle", { username: displayName }),
    description: t("pageDescription", { username: displayName }),
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  return <ProfilePage username={username} />;
}
