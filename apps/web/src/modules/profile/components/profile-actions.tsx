"use client";

import { Button } from "@heroui/react";
import { UserPlus } from "lucide-react";
import { ProfileActionsProps } from "@/types/profile/profile";

export function ProfileActions({
  isOwnProfile,
  isLoading,
  isError,
}: ProfileActionsProps) {
  if (isLoading || isError) return null;

  return (
    <div className="absolute top-0 right-0 p-4">
      <div className="flex gap-2">
        {isOwnProfile ? (
          <></>
        ) : (
          <Button
            size="sm"
            variant="primary"
            className="rounded-full font-semibold px-5 gap-1.5"
          >
            <UserPlus size={14} />
            Follow
          </Button>
        )}
      </div>
    </div>
  );
}
