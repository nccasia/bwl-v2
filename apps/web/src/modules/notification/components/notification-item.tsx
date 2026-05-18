import { Clock } from "lucide-react";
import { NotificationMessage } from "./notification-message";
import { NotificationActorAvatar } from "./notification-actor-avatar";

import { useNotificationItem } from "../hooks/use-notification-item";
import { NotificationActorAvatarProps } from "@/types/notifications/notification";

export function NotificationItem({
  notification,
  icon,
  onMarkAsRead,
}: NotificationActorAvatarProps) {
  const { handleItemClick, containerClassName, timeAgo } = useNotificationItem({
    notification,
    onMarkAsRead,
  });

  return (
    <div className={containerClassName} onClick={handleItemClick}>
      <div className="relative shrink-0">
        <NotificationActorAvatar
          notification={notification}
          className="w-12 h-12 rounded-2xl shadow-sm border-2 border-background"
        />
        <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-lg shadow-sm border border-divider">
          {icon}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="text-[15px] leading-snug tracking-tight">
          <NotificationMessage notification={notification} />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground uppercase tracking-widest bg-content2/50 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </div>
        </div>
      </div>

      {!notification.isRead && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
      )}
    </div>
  );
}
