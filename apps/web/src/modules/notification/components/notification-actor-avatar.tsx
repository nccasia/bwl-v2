"use client";

import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { useGetUser } from "@/modules/shared/hooks/common/use-get-user";
import { NotificationActorAvatarProps } from "@/types/notifications/notification";
import { Skeleton } from "@heroui/react";

export function NotificationActorAvatar({
  notification,
  className,
}: NotificationActorAvatarProps) {
  const actorId = notification.actors?.[0];
  const { data: user, isLoading } = useGetUser(actorId);

  if (isLoading) {
    return <Skeleton className="w-12 h-12 rounded-2xl" />;
  }

  return (
    <UserAvatar
      userId={actorId}
      src={user?.avatar || notification.actor?.image}
      name={user?.username || notification.actor?.name}
      className={className}
    />
  );
}
