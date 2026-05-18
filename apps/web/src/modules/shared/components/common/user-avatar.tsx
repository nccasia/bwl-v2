"use client";

import { Avatar } from "@heroui/react";
import { cn } from "@/utils/utils";
import { UserAvatarProps } from "@/modules/shared/types";
import { useRouter } from "next/navigation";

export function UserAvatar({ userId, src, name, className }: UserAvatarProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (userId) {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/profile/${userId}`);
    }
  };

  return (
    <Avatar.Root
      onClick={userId ? handleClick : undefined}
      className={cn(
        "w-10 h-10 border border-divider rounded-full overflow-hidden shrink-0",
        userId && "cursor-pointer hover:opacity-80 transition-opacity",
        className,
      )}
    >
      <Avatar.Image
        src={src || undefined}
        className="w-full h-full object-cover"
      />
      <Avatar.Fallback className="flex items-center justify-center w-full h-full bg-content2 text-foreground font-semibold">
        {name?.[0]?.toUpperCase() || "?"}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
