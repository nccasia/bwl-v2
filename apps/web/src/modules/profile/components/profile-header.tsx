"use client";

import { Avatar, Skeleton } from "@heroui/react";
import Image from "next/image";
import { ProfileHeaderProps } from "@/types/profile/profile";

export function ProfileHeader({
  profile,
  username,
  isLoading,
  isOwnProfile,
}: ProfileHeaderProps) {
  return (
    <>
      <div className="h-80 rounded-3xl relative mb-0 overflow-hidden">
        <Image
          src="/assets/images/bg_login.jpg"
          alt="cover"
          fill
          className="object-cover rounded-3xl"
        />
      </div>

      <div className="px-4">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            {isLoading ? (
              <Skeleton className="w-24 h-24 rounded-full border-4 border-background" />
            ) : (
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <Avatar.Image src={profile?.avatar} />
                <Avatar.Fallback className="text-2xl font-bold">
                  {(profile?.userName || username).charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
            )}
            {isOwnProfile && !isLoading && (
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
