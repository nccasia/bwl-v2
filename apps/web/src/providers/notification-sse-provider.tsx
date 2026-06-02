'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SSEProvider, useSSE } from 'react-hooks-sse';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/login/auth-store';
import { getClientAccessToken } from '@/libs/get-client-token';
import { createAuthenticatedSseSource } from '@/libs/create-authenticated-sse-source';
import { handleNotificationSseEvent } from '@/modules/notification/lib/handle-sse-event';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5100';

const SSE_ENDPOINT = `${API_BASE_URL}/v1/notifications/sse`;

function NotificationSseSubscriber() {
  const queryClient = useQueryClient();
  const handleEventRef = useRef(handleNotificationSseEvent);

  handleEventRef.current = handleNotificationSseEvent;

  const options = useMemo(
    () => ({
      parser: (data: string) => JSON.parse(data) as unknown,
      stateReducer: (_: null, action: { data: unknown }) => {
        handleEventRef.current(queryClient, action.data);
        return null;
      },
    }),
    [queryClient],
  );

  useSSE('message', null, options);
  useSSE('notification', null, options);

  return null;
}

function NotificationSseConnection() {
  const [isVisible, setIsVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  if (!isVisible) return null;

  return <NotificationSseSubscriber />;
}

export function NotificationSseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.user?.accessToken);
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    if (!hasHydrated || !accessToken) {
      setToken(undefined);
      return;
    }

    let cancelled = false;

    void getClientAccessToken().then((nextToken) => {
      if (!cancelled) {
        setToken(nextToken);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, accessToken]);

  const sourceFactory = useMemo(() => {
    if (!token) return undefined;
    return () => createAuthenticatedSseSource(SSE_ENDPOINT, token);
  }, [token]);

  if (!sourceFactory) {
    return children;
  }

  return (
    <SSEProvider source={sourceFactory} key={token}>
      <NotificationSseConnection />
      {children}
    </SSEProvider>
  );
}
