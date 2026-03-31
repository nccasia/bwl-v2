"use client";

import {
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";
import { AuthUser } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/utils/utils";

interface ProfileDropdownProps {
  user: AuthUser;
  onClose: () => void;
  logout: () => void;
}

function MenuItem({
  icon: Icon,
  text,
  hasArrow,
  shortcut,
  onClick,
  className
}: {
  icon: any;
  text: string;
  hasArrow?: boolean;
  shortcut?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left group",
        className
      )}
    >
      <div className="flex items-center justify-center size-9 rounded-full bg-muted group-hover:bg-muted/80">
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-medium leading-none">{text}</div>
        {shortcut && <div className="text-[11px] text-muted-foreground mt-1">{shortcut}</div>}
      </div>
      {hasArrow && <ChevronRight className="size-5 text-muted-foreground" />}
    </button>
  );
}

export default function ProfileDropdown({
  user,
  onClose,
  logout,
}: ProfileDropdownProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div className="absolute right-0 top-full mt-2 w-[340px] rounded-xl border bg-popover shadow-2xl z-50 p-3 space-y-2">
        {/* Profile Section Card */}
        <Card className="p-2 border-none shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-xl">
          <Link
            href={`/profile/${encodeURIComponent(user.displayName)}`}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg hover:bg-accent transition-colors"
          >
            <Avatar size="lg" className="size-10">
              <AvatarImage src={user.avatar || user.picture} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-[17px] tracking-tight">{user.name || user.displayName}</span>
          </Link>

          <Separator className="my-2" />

          <Link
            href={`/profile/${encodeURIComponent(user.displayName)}`}
            onClick={onClose}
            className="w-full gap-3 bg-primary/10 flex items-center justify-center font-semibold text-primary h-9 rounded-lg hover:bg-primary/30 transition-colors text-[15px]"
          >
            <User className="size-5" />
            Xem tất cả trang cá nhân
          </Link>
        </Card>

        {/* Menu Items */}
        <div className="space-y-1">
          <MenuItem
            icon={LogOut}
            text="Đăng xuất"
            onClick={() => {
              logout();
              onClose();
            }}
          />
        </div>
      </div>
    </>
  );
}