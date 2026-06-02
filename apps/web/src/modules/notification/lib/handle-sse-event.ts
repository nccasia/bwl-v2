import { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-key';
import { REALTIME_EVENTS } from '@/constants/realtime-events';
import { Notification } from '@/types/notifications/notification';
import { Post } from '@/types/home-v2';
import { Comment } from '@/types/comment/comment';
import { ApiResponse } from '@/types/shared';

const REALTIME_EVENT_TYPES = new Set<string>(Object.values(REALTIME_EVENTS));

function isPersonalNotification(event: Record<string, unknown>): boolean {
  return typeof event.id === 'string' && typeof event.recipientId === 'string';
}

function incrementUnreadCount(queryClient: QueryClient) {
  queryClient.setQueryData<ApiResponse<{ count: number }>>(
    QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT.getKey(),
    (old) => ({
      ...(old ?? { statusCode: 200, isSuccess: true }),
      data: { count: (old?.data?.count ?? 0) + 1 },
    }),
  );
}

export function handleNotificationSseEvent(
  queryClient: QueryClient,
  rawEvent: unknown,
) {
  if (!rawEvent || typeof rawEvent !== 'object') return;

  const event = rawEvent as Record<string, unknown>;
  const eventType = event.type;

  if (typeof eventType !== 'string') return;

  if (eventType === REALTIME_EVENTS.POST_REACTION_UPDATED) {
    const { postId, reactions } = event as { postId: string; reactions: unknown[] };
    queryClient.setQueryData(['reactions', 'post', postId], () => reactions);
    return;
  }

  if (eventType === REALTIME_EVENTS.COMMENT_REACTION_UPDATED) {
    const { commentId, reactions } = event as { commentId: string; reactions: unknown[] };
    queryClient.setQueryData(['reactions', 'comment', commentId], () => reactions);
    return;
  }

  if (eventType === REALTIME_EVENTS.POST_COMMENT_UPDATED) {
    const { postId, commentCount } = event as { postId: string; commentCount: number };
    queryClient.setQueryData(
      QUERY_KEYS.HOME_V2.POSTS.getKey(),
      (old: Post[] | undefined) =>
        old?.map((post) =>
          post.id === postId
            ? { ...post, stats: { ...post.stats, comments: commentCount } }
            : post,
        ),
    );
    return;
  }

  if (eventType === REALTIME_EVENTS.POST_COMMENT_CREATED) {
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
          const exists = old.data?.some((item) => item.id === comment.id);
          if (exists) return old;
          return { ...old, data: [...(old.data || []), comment] };
        },
      );
    } else {
      queryClient.setQueryData(
        QUERY_KEYS.COMMENTS.GET_BY_POST.getKey(postId),
        (old: { pages: Array<{ data?: Comment[] }> } | undefined) => {
          if (!old?.pages?.length) return old;
          const firstPage = { ...old.pages[0] };
          const exists = firstPage.data?.some((item) => item.id === comment.id);
          if (exists) return old;
          firstPage.data = [comment, ...(firstPage.data || [])];
          return { ...old, pages: [firstPage, ...old.pages.slice(1)] };
        },
      );
    }
    return;
  }

  if (REALTIME_EVENT_TYPES.has(eventType)) return;
  if (!isPersonalNotification(event)) return;

  const notification = event as unknown as Notification;
  queryClient.setQueryData(
    QUERY_KEYS.NOTIFICATIONS.LIST.getKey(),
    (old: { pages: Array<{ data?: Notification[] }> } | undefined) => {
      if (!old?.pages?.length) return old;

      const firstPage = { ...old.pages[0] };
      const exists = firstPage.data?.some((item) => item.id === notification.id);
      if (exists) return old;

      firstPage.data = [notification, ...(firstPage.data || [])];
      return { ...old, pages: [firstPage, ...old.pages.slice(1)] };
    },
  );

  if (!notification.isRead) {
    incrementUnreadCount(queryClient);
  }
}
