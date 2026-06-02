'use client';

import { useAuthStore } from '@/stores/login/auth-store';
import { getUnreadCount } from '@/services/notification/notification-service';
import { QUERY_KEYS } from '@/constants/query-key';
import { useQuery } from '@tanstack/react-query';

export function useNotificationUnreadCount() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const isEnabled = hasHydrated && !!user?.accessToken;

  const { data: countResponse } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
    queryFn: () => getUnreadCount(),
    enabled: isEnabled,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return countResponse?.data?.count ?? 0;
}
