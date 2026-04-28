"use client";

import { LogIn } from "lucide-react";
import { Button, Badge } from "@heroui/react";
import Link from "next/link";
import { cn } from "@/utils/utils";
import { BWLLogo } from "@/modules/shared/components/common/bwl-logo";
import { useSidebar } from "@/modules/shared/hooks/slide-bar/use-sidebar";
import { useNotifications } from "@/modules/notification/hooks/use-notifications";
import { useAppearanceSection } from "@/modules/settings/hooks";
import { SidebarChannels } from "./sidebar-channels";
import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { UserProfileDropdown } from "./user-profile-dropdown";

export function Sidebar() {
  const { state, actions } = useSidebar();
  const { unreadCount, markAllAsRead } = useNotifications();
  const { state: appearance } =
    useAppearanceSection();

  if (!appearance?.mounted) return null;

  return (
    <aside className="w-[300px] h-screen fixed left-0 top-0 border-r border-divider/60 bg-background flex flex-col z-50 overflow-y-auto custom-scrollbar transition-colors">
      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <Link href="/" className="group cursor-pointer block">
          <BWLLogo useGradient size={44} />
        </Link>
      </div>

      {/* Channel Dropdown */}
      <div className="px-2 mb-2">
        <p className="px-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">
          Channel
        </p>
        <SidebarChannels />
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-divider/50 my-3" />

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-0.5">
        <p className="px-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">
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
                  markAllAsRead?.();
                }
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group active:scale-[0.98]",
                isActive
                  ? "bg-brand-gradient text-white shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-content2",
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 shrink-0",
                  isActive
                    ? "bg-white/20"
                    : "bg-muted-foreground/10 group-hover:bg-brand-start/15 group-hover:text-brand-start",
                )}
              >
                {item.translationKey === "notifications" && unreadCount > 0 ? (
                  <Badge.Anchor>
                    <item.icon
                      className={cn(
                        "w-[18px] h-[18px] transition-all duration-200",
                        isActive
                          ? "text-white"
                          : "group-hover:text-brand-start",
                      )}
                    />
                    <Badge color="danger" size="sm">
                      <Badge.Label>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge.Label>
                    </Badge>
                  </Badge.Anchor>
                ) : (
                  <item.icon
                    className={cn(
                      "w-[18px] h-[18px] transition-all duration-200",
                      isActive ? "text-white" : "group-hover:text-brand-start",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "font-semibold text-[14px] tracking-tight",
                  isActive ? "text-white" : "",
                )}
              >
                {label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-6 h-px bg-divider/50 mt-3" />

      <div className="px-4 py-4 space-y-1">
        {state.isAuthenticated && state.user && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-content2/50 mb-2">
            <UserAvatar
              src={state.user.avatar}
              name={state.user.userName || state.user.displayName}
              className="w-9 h-9 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[13px] text-foreground truncate">
                {state.user.displayName || state.user.userName}
              </span>
              {state.user.userName && (
                <span className="text-[11px] text-muted-foreground truncate">
                  @{state.user.userName}
                </span>
              )}
            </div>
          </div>
        )}

        {state.isAuthenticated ? (
          <UserProfileDropdown />
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-3 rounded-xl font-bold text-[14px] border-none bg-brand-gradient text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] shadow-md shadow-primary/20 group"
            onPress={actions.handleLogin}
          >
            <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
              <LogIn className="w-[18px] h-[18px]" />
            </div>
            {state.t("login")}
          </Button>
        )}
      </div>
    </aside>
  );
}
