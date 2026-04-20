"use client";

import { ReactNode } from "react";
import { Clock } from "lucide-react";
import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/utils/utils";
import { Notification } from "@/types/notifications/notification";

interface NotificationItemProps {
  notification: Notification;
  icon: ReactNode;
  message: ReactNode;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  icon,
  message,
  onMarkAsRead,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "group relative p-4 flex flex-row gap-4 items-start rounded-3xl transition-all duration-300 cursor-pointer active:scale-[0.98]",
        !notification.isRead
          ? "bg-primary/5 hover:bg-primary/10 ring-1 ring-primary/20"
          : "bg-content2/30 hover:bg-content2/60",
      )}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="relative shrink-0">
        <UserAvatar
          src={notification.actor?.image}
          name={notification.actor?.name}
          className="w-12 h-12 rounded-2xl shadow-sm border-2 border-background"
        />
        <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-lg shadow-sm border border-divider">
          {icon}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <p className="text-[15px] leading-snug tracking-tight">{message}</p>

        {notification.body && (
          <div className="mt-2 px-3 py-2 bg-background/50 rounded-xl border border-divider/10">
            <p className="text-sm text-muted-foreground line-clamp-2 italic font-sans leading-relaxed">
              &quot;{notification.body}&quot;
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground uppercase tracking-widest bg-content2/50 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </div>
        </div>
      </div>

      {!notification.isRead && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
      )}
    </div>
  );
}
