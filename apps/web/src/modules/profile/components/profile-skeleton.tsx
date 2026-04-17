"use client";

import { Skeleton } from "@heroui/react";

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-36 bg-content2 rounded-3xl animate-pulse" />

      <div className="px-4">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <Skeleton className="w-24 h-24 rounded-full border-4 border-background" />
        </div>

        <div className="space-y-2.5">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
}
