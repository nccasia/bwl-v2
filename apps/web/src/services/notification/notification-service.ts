import { apiClient } from '@/libs/api-client';
import { Notification } from '@/types/notifications/notification';
import { QueryParams } from '@/types/shared/base-api';

export async function getNotifications(queryOptions?: QueryParams) {
  return apiClient.get<Notification[]>('/v1/notifications', {
    params: queryOptions,
  });
}

export async function markAsRead(id: string) {
  return apiClient.patch<Notification>(`/v1/notifications/${id}/read`, null);
}

export async function markAllAsRead() {
  return apiClient.patch<void>('/v1/notifications/read-all', null);
}

export async function getUnreadCount() {
  return apiClient.get<{ count: number }>('/v1/notifications/unread-count');
}
