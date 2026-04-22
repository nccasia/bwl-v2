import { useCallback, useMemo } from "react";
import { NotificationActorAvatarProps } from "@/types/notifications/notification";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/utils/utils";

export function useNotificationItem({
  notification,
  onMarkAsRead,
}: NotificationActorAvatarProps) {
  const handleItemClick = useCallback(() => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [notification.id, notification.isRead, onMarkAsRead]);

  const containerClassName = useMemo(() => {
    return cn(
      "group relative p-4 flex flex-row gap-4 items-start rounded-3xl transition-all duration-300 cursor-pointer active:scale-[0.98]",
      !notification.isRead
        ? "bg-primary/5 hover:bg-primary/10 ring-1 ring-primary/20"
        : "bg-content2/30 hover:bg-content2/60",
    );
  }, [notification.isRead]);

  const timeAgo = useMemo(() => {
    return formatDistanceToNow(new Date(notification.createdAt), {
      addSuffix: true,
      locale: vi,
    });
  }, [notification.createdAt]);

  return {
    handleItemClick,
    containerClassName,
    timeAgo,
  };
}
