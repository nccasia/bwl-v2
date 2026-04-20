import { create } from 'zustand';
import { Notification, NotificationState } from '@/types/notifications/notification';
import { 
  getNotificationsAction, 
  markAsReadAction, 
  markAllAsReadAction 
} from '@/services/notification/notification-actions-service';

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async (reset = false) => {
    set({ isLoading: true });
    try {
      const response = await getNotificationsAction();
      if (response.isSuccess && response.data) {
        set((state) => ({
          notifications: reset ? (response.data as Notification[]) : [...state.notifications, ...(response.data as Notification[])],
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  markAsRead: async (id: string) => {
    try {
      const response = await markAsReadAction(id);
      if (response.isSuccess) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await markAllAsReadAction();
      if (response.isSuccess) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
}));
