import { useNotificationMessage } from "../hooks/use-notification-message";
import { Skeleton } from "@heroui/react";
import { NotificationActorAvatarProps } from "@/types/notifications/notification";

export function NotificationMessage({
  notification,
}: NotificationActorAvatarProps) {
  const { content, isLoading } = useNotificationMessage(notification);

  if (isLoading) {
    return <Skeleton className="h-4 w-48 rounded-lg" />;
  }

  return (
    <>
      <span className="font-bold font-sans">{content.actorName}</span>
      {content.actionText}
      {content.ownerDisplayName && (
        <span className="font-bold font-sans">{content.ownerDisplayName}</span>
      )}
    </>
  );
}
