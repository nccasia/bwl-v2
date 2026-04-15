"use client";

import { Avatar } from "@heroui/react";
import { cn } from "@/utils/utils";
import { UserAvatarProps } from "@/modules/shared/types";


export function UserAvatar({ src, name, className }: UserAvatarProps) {
  return (
    <Avatar.Root
      className={cn(
        "w-10 h-10 border border-divider rounded-full overflow-hidden shrink-0",
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
