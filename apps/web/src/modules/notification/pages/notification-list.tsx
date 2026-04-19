"use client";

import { useNotifications } from "../hooks/use-notifications";
import { NotificationHeader } from "../components/notification-header";
import { NotificationItem } from "../components/notification-item";
import { NotificationEmpty } from "../components/notification-empty";
import { NotificationSkeleton } from "../components/notification-skeleton";

export function NotificationList() {
  const {
    notifications,
    isLoading,
    getIcon,
    getMessage,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (isLoading && notifications.length === 0) {
    return <NotificationSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <NotificationHeader
        onMarkAllAsRead={markAllAsRead}
        showMarkAll={notifications.length > 0}
      />

      <hr className="border-divider/50 border-t" />

      {notifications.length === 0 ? (
        <NotificationEmpty />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              icon={getIcon(notification.type)}
              message={getMessage(notification)}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
