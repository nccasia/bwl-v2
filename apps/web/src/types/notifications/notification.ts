export enum NotificationType {
  POST_REACTION = 'post_reaction',
  POST_COMMENT = 'post_comment',
  COMMENT_REPLY = 'comment_reply',
}

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityId: string;
  entityType: string;
  isRead: boolean;
  body?: string;
  createdAt: string;
  updatedAt: string;
  actor?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  
  fetchNotifications: (reset?: boolean) => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
