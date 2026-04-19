"use client";

import { useEffect, useCallback, ReactNode } from "react";
import { useNotificationStore } from "@/stores/notification/use-notification-store";
import { NotificationType, Notification } from "@/types/notifications/notification";
import {
  MessageSquare,
  Heart,
  Reply,
  Bell,
} from "lucide-react";
import React from "react";

export interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: (reset?: boolean) => Promise<void>;
  getIcon: (type: NotificationType) => ReactNode;
  getMessage: (notification: Notification) => ReactNode;
}

export function useNotifications(): UseNotificationsReturn {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const getIcon = useCallback((type: NotificationType): ReactNode => {
    switch (type) {
      case NotificationType.POST_REACTION:
        return <Heart className="w-4 h-4 text-danger fill-danger" />;
      case NotificationType.POST_COMMENT:
        return <MessageSquare className="w-4 h-4 text-primary" />;
      case NotificationType.COMMENT_REPLY:
        return <Reply className="w-4 h-4 text-success" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  }, []);

  const getMessage = useCallback((notification: Notification): ReactNode => {
    const actorName = notification.actor?.name || "Một người dùng";
    switch (notification.type) {
      case NotificationType.POST_REACTION:
        return (
          <>
            <span className="font-bold font-sans">{actorName}</span> đã bày tỏ
            cảm xúc về bài viết của bạn
          </>
        );
      case NotificationType.POST_COMMENT:
        return (
          <>
            <span className="font-bold font-sans">{actorName}</span> đã bình
            luận về bài viết của bạn
          </>
        );
      case NotificationType.COMMENT_REPLY:
        return (
          <>
            <span className="font-bold font-sans">{actorName}</span> đã trả lời
            bình luận của bạn
          </>
        );
      default:
        return "Thông báo mới";
    }
  }, []);

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    getIcon,
    getMessage,
  };
}
