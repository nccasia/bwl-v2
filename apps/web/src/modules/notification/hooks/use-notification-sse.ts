import { useEffect } from "react";
import { useAuthStore } from "@/stores/login/auth-store";
import { notificationClientService } from "@/services/notification/notification-client-service";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-key";
import { Notification } from "@/types/notifications/notification";

export function useNotificationSSE() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.accessToken) return;

    const controller = new AbortController();

    notificationClientService
      .subscribe(
        user.accessToken,
        (notification) => {
          queryClient.setQueryData(
            QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
            (old: { data: Notification[] } | undefined) => ({
              ...old,
              data: [notification, ...(old?.data || [])],
            })
          );

          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
          });
        },
        controller.signal
      )
      .catch((e) => {
        if ((e as Error).name !== "AbortError") {
          throw new Error(e as string);
        }
      });

    return () => controller.abort();
  }, [user?.accessToken, queryClient]);
}
