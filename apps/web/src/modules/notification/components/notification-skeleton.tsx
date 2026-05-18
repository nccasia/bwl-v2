"use client";

export function NotificationSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-content2 rounded-2xl" />
      ))}
    </div>
  );
}
