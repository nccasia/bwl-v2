import { NotificationList } from "@/modules/notification/pages/notification-list";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notifications");

  return {
    title: t("title"),
    description: t("pageDescription"),
  };
}

export default function NotificationsPage() {
  return <NotificationList />;
}
