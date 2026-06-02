'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllAsRead } from '@/services/notification/notification-service';
import { QUERY_KEYS } from '@/constants/query-key';
import { ApiResponse } from '@/types/shared';

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData<ApiResponse<{ count: number }>>(
        QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
        (old) => ({
          ...(old ?? { statusCode: 200, isSuccess: true }),
          data: { count: 0 },
        }),
      );
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
      });
    },
  });
}
