import { apiClient } from '@/libs/api-client';
import { auth } from '@/libs/auth';
import { Notification } from '@/types/notifications/notification';
import { QueryParams } from '@/types/shared/base-api';
import { headers } from 'next/headers';

export async function getNotifications(queryOptions?: QueryParams) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const token = session?.user?.accessToken;

  return apiClient.get<Notification[]>('/v1/notifications', {
    params: queryOptions,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function markAsRead(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
    const token = session?.user?.accessToken;

    return apiClient.patch<Notification>(`/v1/notifications/${id}/read`, null, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

export async function markAllAsRead() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
    const token = session?.user?.accessToken;

    return apiClient.patch<void>('/v1/notifications/read-all', null, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

export async function getUnreadCount() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const token = session?.user?.accessToken;

  return apiClient.get<{ count: number }>('/v1/notifications/unread-count', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
