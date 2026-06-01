import { apiClient } from '@/libs/api-client';
import { auth } from '@/libs/auth';
import { Notification } from '@/types/notifications/notification';
import { QueryParams } from '@/types/shared/base-api';
import { headers } from 'next/headers';

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getNotifications(queryOptions?: QueryParams) {
  const session = await getSession();

  if (!session) {
    return {
      data: [],
      statusCode: 200,
      isSuccess: true,
    };
  }

  return apiClient.get<Notification[]>('/v1/notifications', {
    params: queryOptions,
  });
}

export async function markAsRead(id: string) {
  const session = await getSession();

  if (!session) {
    return {
      isSuccess: false,
      message: 'Unauthorized',
      statusCode: 401,
    };
  }

  return apiClient.patch<Notification>(`/v1/notifications/${id}/read`, null);
}

export async function markAllAsRead() {
  const session = await getSession();

  if (!session) {
    return {
      isSuccess: false,
      message: 'Unauthorized',
      statusCode: 401,
    };
  }

  return apiClient.patch<void>('/v1/notifications/read-all', null);
}

export async function getUnreadCount() {
  const session = await getSession();

  if (!session) {
    return {
      data: { count: 0 },
      statusCode: 200,
      isSuccess: true,
    };
  }

  return apiClient.get<{ count: number }>('/v1/notifications/unread-count');
}
