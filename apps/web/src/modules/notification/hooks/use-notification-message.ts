"use client";

import { useGetUser } from "@/modules/shared/hooks/common/use-get-user";
import { useAuthStore } from "@/stores/login/auth-store";
import { Notification, NotificationType } from "@/types/notifications/notification";

export function useNotificationMessage(notification: Notification) {
  const user = useAuthStore((state) => state.user);
  
  const actorId = notification.actors?.[0];
  const { data: actor, isLoading: isActorLoading } = useGetUser(actorId);
  
  const recipientId = notification.recipientId;
  const { data: recipient, isLoading: isRecipientLoading } = useGetUser(recipientId);

  const isLoading = isActorLoading || isRecipientLoading;

  const actorName = actor?.username || notification.actor?.name;
  const recipientName = recipient?.username || "bạn";
  const isMine = user?.id === recipientId;
  const ownerDisplayName = isMine ? "bạn" : recipientName;

  const getMessageContent = () => {
    switch (notification.type) {
      case "reaction":
      case NotificationType.POST_REACTION:
        return {
          actorName,
          actionText: " đã thích bài viết của ",
          ownerDisplayName
        };
      case "comment":
      case NotificationType.POST_COMMENT:
        return {
          actorName,
          actionText: " đã bình luận về bài viết của ",
          ownerDisplayName
        };
      case "comment_reply":
      case NotificationType.COMMENT_REPLY:
        return {
          actorName,
          actionText: " đã trả lời bình luận của ",
          ownerDisplayName
        };
      default:
        return {
          actorName: "",
          actionText: "Thông báo mới",
          ownerDisplayName: ""
        };
    }
  };

  return {
    isLoading,
    content: getMessageContent(),
  };
}
