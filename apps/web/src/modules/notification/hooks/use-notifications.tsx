"use client";

import { useAuthStore } from "@/stores/login/auth-store";
import {
  getNotificationsAction,
  markAllAsReadAction,
  markAsReadAction,
  getUnreadCountAction,
} from "@/services/notification/notification-actions-service";
import { QUERY_KEYS } from "@/constants/query-key";
import {
  NotificationType,
  Notification,
} from "@/types/notifications/notification";
import { MessageSquare, Heart, Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useCallback } from "react";

export function useNotifications() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: listResponse, isLoading: isListLoading } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
    queryFn: () => getNotificationsAction(),
    enabled: !!user?.accessToken,
  });

  const { data: countResponse } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
    queryFn: () => getUnreadCountAction(),
    enabled: !!user?.accessToken,
  });

  const notifications = (listResponse?.data as Notification[]) || [];
  const unreadCount = countResponse?.data?.count || 0;

  const markAsRead = useMutation({
    mutationFn: (id: string) => markAsReadAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
      });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => markAllAsReadAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
      });
    },
  });

  const getIcon = useCallback((type: NotificationType | string): ReactNode => {
    switch (type) {
      case NotificationType.Reaction:
        return <Heart className="w-4 h-4 text-danger fill-danger" />;
      case NotificationType.Comment:
        return <MessageSquare className="w-4 h-4 text-primary" />;
      case NotificationType.Follow:
        return <Bell className="w-4 h-4 text-warning" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  }, []);

  return {
    notifications,
    isLoading: isListLoading,
    unreadCount,
    markAsRead: (id: string) => markAsRead.mutateAsync(id),
    markAllAsRead: () => markAllAsRead.mutateAsync(),
    getIcon,
  };
}
