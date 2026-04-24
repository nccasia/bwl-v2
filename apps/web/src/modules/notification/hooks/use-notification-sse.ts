"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/login/auth-store";
import { notificationClientService } from "@/services/notification/notification-client-service";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-key";
import { REALTIME_EVENTS } from "@/constants/realtime-events";
import { Notification } from "@/types/notifications/notification";
import { Post } from "@/types/home-v2";
import { Comment } from "@/types/comment/comment";

const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 1_000;

export function useNotificationSSE() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const controllerRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isActiveRef = useRef(true);

  const handleEvent = useCallback(
    (rawEvent: unknown) => {
      const event = rawEvent as Record<string, unknown>;

      // Skip heartbeat — empty data or no event type field
      if (!event || !event.type) return;

      // Handle post:reaction_updated
      if (event.type === REALTIME_EVENTS.POST_REACTION_UPDATED) {
        const { postId, reactions } = event as { postId: string; reactions: unknown[] };
        queryClient.setQueryData(["reactions", "post", postId], () => reactions);
        return;
      }

      // Handle comment:reaction_updated
      if (event.type === REALTIME_EVENTS.COMMENT_REACTION_UPDATED) {
        const { commentId, reactions } = event as { commentId: string; reactions: unknown[] };
        queryClient.setQueryData(["reactions", "comment", commentId], () => reactions);
        return;
      }

      // Handle post:comment_updated (count)
      if (event.type === REALTIME_EVENTS.POST_COMMENT_UPDATED) {
        const { postId, commentCount } = event as { postId: string; commentCount: number };
        queryClient.setQueryData(
          QUERY_KEYS.HOME_V2.POSTS.getKey(),
          (old: Post[] | undefined) =>
            old?.map((p) =>
              p.id === postId ? { ...p, stats: { ...p.stats, comments: commentCount } } : p
            )
        );
        return;
      }

      // Handle post:comment_created — inject new comment into the list cache
      if (event.type === REALTIME_EVENTS.POST_COMMENT_CREATED) {
        const { postId, parentId, comment } = event as {
          postId: string;
          parentId: string | null;
          comment: Comment;
        };

        if (parentId) {
          queryClient.setQueryData(
            QUERY_KEYS.COMMENTS.GET_REPLIES.getKey(parentId),
            (old: { data: Comment[] } | undefined) => {
              if (!old) return old;
              const exists = old.data?.some((c) => c.id === comment.id);
              if (exists) return old;
              return { ...old, data: [...(old.data || []), comment] };
            }
          );
        } else {
          queryClient.setQueryData(
            QUERY_KEYS.COMMENTS.GET_BY_POST.getKey(postId),
            (old: any) => {
              if (!old?.pages?.length) return old;
              const firstPage = { ...old.pages[0] };
              const exists = firstPage.data?.some((c: Comment) => c.id === comment.id);
              if (exists) return old;
              firstPage.data = [comment, ...(firstPage.data || [])];
              return { ...old, pages: [firstPage, ...old.pages.slice(1)] };
            }
          );
        }
        return;
      }

      // Default: personal notification — inject into notification list
      const notification = rawEvent as Notification;
      queryClient.setQueryData(QUERY_KEYS.NOTIFICATIONS.LIST.getKey(), (old: any) => {
        if (!old?.pages?.length) return old;
        const firstPage = { ...old.pages[0] };
        firstPage.data = [notification, ...(firstPage.data || [])];
        return { ...old, pages: [firstPage, ...old.pages.slice(1)] };
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey() });
    },
    [queryClient]
  );

  const connect = useCallback(
    (accessToken: string) => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      notificationClientService
        .subscribe(accessToken, handleEvent, controller.signal)
        .then(() => {
          // Stream ended cleanly — reconnect if still active
          if (!controller.signal.aborted && isActiveRef.current) {
            scheduleReconnect(accessToken);
          }
        })
        .catch((e: Error) => {
          if (e.name === "AbortError" || controller.signal.aborted) return;
          if (isActiveRef.current) scheduleReconnect(accessToken);
        });
    },
    [handleEvent] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const scheduleReconnect = (accessToken: string) => {
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttemptRef.current,
      MAX_RECONNECT_DELAY_MS
    );
    reconnectAttemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => {
      if (isActiveRef.current) connect(accessToken);
    }, delay);
  };

  useEffect(() => {
    if (!user?.accessToken) return;

    const accessToken = user.accessToken;

    if (document.visibilityState === "visible") {
      isActiveRef.current = true;
      reconnectAttemptRef.current = 0;
      connect(accessToken);
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab active → reconnect
        isActiveRef.current = true;
        reconnectAttemptRef.current = 0;
        connect(accessToken);
      } else {
        // Tab hidden → disconnect to save server resources
        isActiveRef.current = false;
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        controllerRef.current?.abort();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      isActiveRef.current = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      controllerRef.current?.abort();
    };
  }, [user?.accessToken, connect]);
}
