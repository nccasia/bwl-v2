import { AtSign, Heart, MessageCircle } from "lucide-react";
import { Notification } from "@/components/notifications/hook/useNotifications";
import { useTranslations } from "next-intl";



export function IconForType({ type }: { type: string }) {
  const t = useTranslations("notifications");
  switch (type) {
    case "reaction": return <Heart className="w-full h-full text-white fill-white" />;
    case "comment": return <MessageCircle className="w-full h-full text-white fill-white" />;
    case "reply": return <AtSign className="w-full h-full text-white" />;
    default: return <Heart className="w-full h-full text-white fill-white" />;
  }
}

export const getNotificationText = (n: Notification) => {
  const t = useTranslations("notifications");
  switch (n.type) {
    case "reaction": return t("like");
    case "comment": return t("comment");
    case "reply": return t("reply");
    default: return n.content || t("default");
  }
};