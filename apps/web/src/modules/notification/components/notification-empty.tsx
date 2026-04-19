"use client";

import { Bell } from "lucide-react";

export function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-content2/30 rounded-3xl border-2 border-dashed border-divider">
      <Bell className="w-12 h-12 mb-4 opacity-10" />
      <p className="font-medium italic text-[15px]">
        Chưa có thông báo nào dành cho bạn
      </p>
    </div>
  );
}
