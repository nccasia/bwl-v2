"use client";

import { CheckCheck } from "lucide-react";
import { Button } from "@heroui/react";

interface NotificationHeaderProps {
  onMarkAllAsRead: () => void;
  showMarkAll: boolean;
}

export function NotificationHeader({
  onMarkAllAsRead,
  showMarkAll,
}: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <h1 className="text-2xl font-black tracking-tight font-sans italic italic">
        Thông báo
      </h1>
      {showMarkAll && (
        <Button
          variant="ghost"
          onPress={onMarkAllAsRead}
          className="font-bold font-sans text-primary border-primary/20 hover:bg-primary/10 gap-2"
        >
          <CheckCheck className="w-4 h-4" />
          Đánh dấu tất cả là đã đọc
        </Button>
      )}
    </div>
  );
}
