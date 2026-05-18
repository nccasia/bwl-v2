import { Skeleton } from "@heroui/react";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-5 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
