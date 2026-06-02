"use client";

import { useAuthStore } from "@/stores/login/auth-store";
import {
  getNotifications,
  markAllAsRead as markAllAsReadRequest,
  markAsRead as markAsReadRequest,
} from "@/services/notification/notification-service";
import { QUERY_KEYS } from "@/constants/query-key";
import {
  NotificationType,
  Notification,
} from "@/types/notifications/notification";
import { MessageSquare, Heart, Bell } from "lucide-react";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { ReactNode, useCallback } from "react";
import { ApiResponse } from "@/types/shared";

export function useNotifications() {
  const queryClient = useQueryClient();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const isEnabled = hasHydrated && !!user?.accessToken;

  const {
    data: listResponse,
    isLoading: isListLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
    queryFn: ({ pageParam }) => getNotifications({ nextCursor: pageParam as string }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ApiResponse<Notification[]>) =>
      lastPage.pagination?.nextCursor ?? undefined,
    enabled: isEnabled,
  });

  const allNotifications =
    listResponse?.pages.flatMap((page) => (page.data as Notification[]) || []) || [];
  const notifications = Array.from(
    new Map(allNotifications.map((notification) => [notification.id, notification])).values(),
  );

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markAsReadRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsReadRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
      });
      queryClient.setQueryData(QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(), (old: ApiResponse<{ count: number }> | undefined) => ({
        ...(old ?? { statusCode: 200, isSuccess: true }),
        data: { count: 0 },
      }));
    },
  });

  const getIcon = useCallback((type: NotificationType | string): ReactNode => {
    switch (type) {
      case NotificationType.Reaction:
        return <Heart className="w-4 h-4 text-danger fill-danger" />;
      case NotificationType.Comment:
      case NotificationType.Reply:
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
    markAsRead: (id: string) => markAsReadMutation.mutateAsync(id),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    getIcon,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
