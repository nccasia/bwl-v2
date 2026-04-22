import { ReactNode } from "react";

export enum NotificationType {
  POST_REACTION = 'post_reaction',
  POST_COMMENT = 'post_comment',
  COMMENT_REPLY = 'comment_reply',
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType | string;
  actors: string[];
  actorCount: number;
  entityId: string;
  entityType: string;
  isRead: boolean;
  body?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  actor?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface NotificationState {
  notifications?: Notification[];
  isLoading?: boolean;
  unreadCount?: number;
  actorCache?: Record<string, { id: string; name: string; image?: string }>;
  
  fetchNotifications?: (reset?: boolean) => Promise<void>;
  fetchUnreadCount?: () => Promise<void>;
  addNotification?: (notification: Notification) => void;
  updateNotification?: (id: string, updates: Partial<Notification>) => void;
  setActorCache?: (id: string, data: { id: string; name: string; image?: string }) => void;
  markAsRead?: (id: string) => Promise<void>;
  markAllAsRead?: () => Promise<void>;
  getIcon?: (type: NotificationType | string) => ReactNode;
  getMessage?: (notification: Notification) => ReactNode;
}

export interface NotificationActorAvatarProps {
  notification: Notification;
  className?: string;
  icon?: ReactNode;
  onMarkAsRead?: (id: string) => void;
}