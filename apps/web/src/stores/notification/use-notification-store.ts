import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Notification, NotificationState } from '@/types/notifications/notification';

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      isLoading: false,
      unreadCount: 0,

      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...(state.notifications || [])],
          unreadCount: (state.unreadCount || 0) + 1
        }));
      },

      updateNotification: (id: string, updates: Partial<Notification>) => {
        set((state) => ({
          notifications: state.notifications?.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
