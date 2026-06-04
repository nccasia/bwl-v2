"use client";

import { Mail } from "lucide-react";
import { ProfileInfoProps } from "@/types/profile/profile";

export function ProfileInfo({
  profile,
  isLoading,
}: ProfileInfoProps) {
  if (isLoading) return null;

  return (
    <div className="px-4">
      <div className="mb-3">
        <h1 className="font-bold text-xl leading-tight">{profile?.userName}</h1>
        <p className="text-muted-foreground text-sm">@{profile?.userName}</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-4">
        {profile?.email && (
          <span className="flex items-center gap-1.5">
            <Mail size={13} />
            {profile.email}
          </span>
        )}
      </div>
    </div>
  );
}
