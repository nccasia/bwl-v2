"use client";

import { useNotifications } from "../hooks/use-notifications";
import { NotificationHeader } from "../components/notification-header";
import { NotificationItem } from "../components/notification-item";
import { NotificationEmpty } from "../components/notification-empty";
import { NotificationSkeleton } from "../components/notification-skeleton";
import { useInView } from "@/modules/shared/hooks/common/use-in-view";
import { useEffect } from "react";
import { Spinner } from "@heroui/react";

export function NotificationList() {
  const {
    notifications,
    isLoading,
    getIcon,
    markAsRead,
    markAllAsRead,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();

  const { ref, isInView } = useInView({ rootMargin: '500px' });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isInView && hasNextPage && !isFetchingNextPage) {
      // Add a small debounce to prevent rapid re-triggering
      timer = setTimeout(() => {
        fetchNextPage();
      }, 300);
    }
    
    return () => clearTimeout(timer);
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
              onMarkAsRead={markAsRead}
            />
          ))}
          
          {/* Loading trigger */}
          {hasNextPage && (
            <div ref={ref} className="min-h-[60px] w-full flex items-center justify-center py-4">
              {isFetchingNextPage ? (
                <Spinner color="accent" size="sm" />
              ) : (
                <div className="h-1 w-1 opacity-0" /> /* Placeholder to keep space */
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
