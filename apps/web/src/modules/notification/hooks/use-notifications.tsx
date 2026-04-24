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
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { ReactNode, useCallback, useState, useEffect, useRef } from "react";
import { ApiResponse } from "@/types/shared";

export function useNotifications() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { 
    data: listResponse, 
    isLoading: isListLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
    queryFn: ({ pageParam }) => getNotificationsAction({ nextCursor: pageParam as string }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ApiResponse<Notification[]>) => {
      if (!lastPage.data || lastPage.data.length <= 1) {
        return undefined;
      }
      return lastPage.pagination?.nextCursor;
    },
    enabled: !!user?.accessToken,
  });

  const { data: countResponse } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
    queryFn: () => getUnreadCountAction(),
    enabled: !!user?.accessToken,
  });

  const [stableHasNextPage, setStableHasNextPage] = useState(true);
  const emptyFetchCount = useRef(0);
  const lastUniqueCount = useRef(0);

  const allNotifications = listResponse?.pages.flatMap((page) => (page.data as Notification[]) || []) || [];
  const notifications = Array.from(new Map(allNotifications.map(n => [n.id, n])).values());
  const unreadCount = countResponse?.data?.count || 0;

  useEffect(() => {
    if (!isListLoading) {
      const currentCount = notifications.length;
      if (currentCount > 0) {
        if (currentCount === lastUniqueCount.current) {
          emptyFetchCount.current += 1;
        } else {
          emptyFetchCount.current = 0;
          lastUniqueCount.current = currentCount;
        }
      }
      if (emptyFetchCount.current >= 3) {
        setStableHasNextPage(false);
      }
    }
  }, [notifications.length, isListLoading]);

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
    fetchNextPage,
    hasNextPage: hasNextPage && stableHasNextPage,
    isFetchingNextPage,
  };
}
