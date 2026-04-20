"use client";

import { Mail, Shield, UserCheck } from "lucide-react";
import { ProfileInfoProps } from "@/types/profile/profile";

export function ProfileInfo({
  profile,
  isOwnProfile,
  isLoading,
}: ProfileInfoProps) {
  if (isLoading) return null;

  return (
    <div className="px-4">
      <div className="mb-3">
        <h1 className="font-bold text-xl leading-tight">{profile?.username}</h1>
        <p className="text-muted-foreground text-sm">@{profile?.username}</p>
      </div>

      {isOwnProfile && (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
          <UserCheck size={12} />
          This is you
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-4">
        {profile?.email && (
          <span className="flex items-center gap-1.5">
            <Mail size={13} />
            {profile.email}
          </span>
        )}
        {profile?.role && (
          <span className="flex items-center gap-1.5">
            <Shield size={13} />
            {profile.role}
          </span>
        )}
      </div>
    </div>
  );
}
