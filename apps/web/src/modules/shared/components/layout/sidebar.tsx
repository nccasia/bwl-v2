"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { Button, Badge } from "@heroui/react";
import Link from "next/link";
import { cn } from "@/utils/utils";
import { BWLLogo } from "@/modules/shared/components/common/bwl-logo";
import { useSidebar } from "@/modules/shared/hooks/slide-bar/use-sidebar";
import { useNotificationUnreadCount } from "@/modules/notification/hooks/use-notification-unread-count";
import { useMarkAllNotificationsRead } from "@/modules/notification/hooks/use-mark-all-notifications-read";
import { useAppearanceSection } from "@/modules/settings/hooks";
import { SidebarChannels } from "./sidebar-channels";
import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { UserProfileDropdown } from "./user-profile-dropdown";

export function Sidebar() {
  const { state, actions } = useSidebar();
  const unreadCount = useNotificationUnreadCount();
  const markAllAsReadMutation = useMarkAllNotificationsRead();
  const { state: appearance } = useAppearanceSection();

  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isExpanded = isHovered || isDropdownOpen;

  if (!appearance?.mounted) return null;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "h-screen fixed left-0 top-0",
        "border-r border-divider/60 bg-background",
        "flex flex-col z-50",
        "transition-all duration-300 ease-in-out",
        isExpanded ? "w-[280px] overflow-visible" : "w-[72px] overflow-hidden",
      )}
    >
      <div className="px-4 pt-7 pb-5 flex items-center">
        <Link href="/" className="group cursor-pointer block shrink-0">
          <BWLLogo useGradient size={40} />
        </Link>
      </div>

      <div className="px-2 mb-2">
        <p className={cn(
          "px-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2",
          "transition-opacity duration-200 whitespace-nowrap",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          Channel
        </p>
        <SidebarChannels isExpanded={isExpanded} />
      </div>

      <div className="mx-4 h-px bg-divider/50 my-1" />

      <nav className="flex-1 px-2 space-y-4 mt-2">
        <p className={cn(
          "px-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2",
          "transition-opacity duration-200 whitespace-nowrap",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          Menu
        </p>
        {state.filteredItems.map((item) => {
          const isActive = state.pathname === item.href;
          const label = state.t(item.translationKey);
          return (
            <Link
              key={item.translationKey}
              href={item.href}
              onClick={() => {
                if (item.translationKey === "notifications") {
                  markAllAsReadMutation.mutate();
                }
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group active:scale-[0.98]",
                isActive
                  ? "bg-gradient-to-r from-brand-start to-brand-end text-white shadow-lg shadow-brand/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-200",
              )}
            >
              <div className="p-1.5 rounded-lg transition-all duration-200 shrink-0 bg-muted-foreground/10">
                {item.translationKey === "notifications" && unreadCount > 0 ? (
                  <Badge.Anchor>
                    <item.icon className="w-[18px] h-[18px] transition-all duration-200" />
                    <Badge color="danger" size="sm">
                      <Badge.Label>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge.Label>
                    </Badge>
                  </Badge.Anchor>
                ) : (
                  <item.icon className="w-[18px] h-[18px] transition-all duration-200" />
                )}
              </div>

              <span
                className={cn(
                  "font-semibold text-[14px] tracking-tight whitespace-nowrap",
                  "transition-opacity duration-200",
                  isExpanded ? "opacity-100" : "opacity-0",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-divider/50 mt-3" />

      <div className="px-2 py-4 space-y-1">
        {state.isAuthenticated && state.user && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-content2/50 mb-2 overflow-hidden">
            <UserAvatar
              src={state.user.avatar}
              name={state.user.userName || state.user.displayName}
              className="w-9 h-9 shrink-0"
            />
            <div className={cn(
              "flex flex-col min-w-0",
              "transition-opacity duration-200",
              isExpanded ? "opacity-100" : "opacity-0"
            )}>
              <span className="font-bold text-[13px] text-foreground truncate whitespace-nowrap">
                {state.user.displayName || state.user.userName}
              </span>
              {state.user.userName && (
                <span className="text-[11px] text-muted-foreground truncate whitespace-nowrap">
                  @{state.user.userName}
                </span>
              )}
            </div>
          </div>
        )}

        {state.isAuthenticated ? (
          <UserProfileDropdown
            isExpanded={isExpanded}
            onOpenChange={setIsDropdownOpen}
          />
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-3 rounded-xl font-bold text-[14px] border-none bg-brand-gradient text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] shadow-md shadow-primary/20 group"
            onPress={actions.handleLogin}
          >
            <LogIn />
            <span className={cn(
              "whitespace-nowrap transition-opacity duration-200",
              isExpanded ? "opacity-100" : "opacity-0"
            )}>
              {state.t("login")}
            </span>
          </Button>
        )}
      </div>
    </aside>
  );
}
