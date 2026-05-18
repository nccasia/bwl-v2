"use client";

import { useGetUser } from "@/modules/shared/hooks/common/use-get-user";
import { useAuthStore } from "@/stores/login/auth-store";
import { Notification, NotificationType } from "@/types/notifications/notification";

export function useNotificationMessage(notification: Notification) {
  const user = useAuthStore((state) => state.user);
  
  const firstActorId = notification.actors?.[0];
  const secondActorId = notification.actors?.[1];
  
  const { data: firstActor, isLoading: isFirstActorLoading } = useGetUser(firstActorId);
  const { data: secondActor, isLoading: isSecondActorLoading } = useGetUser(secondActorId);
  
  const recipientId = notification.recipientId;
  const { data: recipient, isLoading: isRecipientLoading } = useGetUser(recipientId);

  const isLoading = isFirstActorLoading || isSecondActorLoading || isRecipientLoading;

  const getActorDisplayText = () => {
    const actor1 = firstActor?.userName || notification.actor?.userName || "Người dùng";
    const actorCount = notification.actorCount || 1;

    if (actorCount === 1) {
      return <span className="font-bold font-sans">{actor1}</span>;
    }

    if (actorCount === 2 && secondActor) {
      const actor2 = secondActor.userName;
      return (
        <>
          <span className="font-bold font-sans">{actor1}</span> và{" "}
          <span className="font-bold font-sans">{actor2}</span>
        </>
      );
    }

    return (
      <>
        <span className="font-bold font-sans">{actor1}</span> và{" "}
        <span className="font-bold font-sans">{actorCount - 1} người khác</span>
      </>
    );
  };

  const recipientName = recipient?.userName || "bạn";
  const isMine = user?.id === recipientId;
  const ownerDisplayName = isMine ? "bạn" : <span className="font-bold font-sans">{recipientName}</span>;

  const getMessageContent = () => {
    const actorText = getActorDisplayText();
    
    switch (notification.type) {
      case NotificationType.Reaction:
        return {
          actorText,
          actionText: " đã thích bài viết của ",
          ownerDisplayName
        };
      case NotificationType.Comment:
        return {
          actorText,
          actionText: " đã bình luận về bài viết của ",
          ownerDisplayName
        };
      case NotificationType.Reply:
        return {
          actorText,
          actionText: " đã trả lời bình luận của ",
          ownerDisplayName
        };
      case NotificationType.Follow:
        return {
          actorText,
          actionText: " đã bắt đầu theo dõi ",
          ownerDisplayName: isMine ? "bạn" : ownerDisplayName
        };
      default:
        return {
          actorText: "",
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
