"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Dropdown, Separator } from "@heroui/react";
import { Settings, Moon, Sun, LogOut, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppearanceSection } from "@/modules/settings/hooks";
import { useSidebar } from "@/modules/shared/hooks/slide-bar/use-sidebar";
import { UserAvatar } from "@/modules/shared/components/common/user-avatar";

export function UserProfileDropdown() {
  const t = useTranslations("sidebar");
  const { state: appearance, actions: appearanceActions } =
    useAppearanceSection();
  const { state: sidebarState, actions: sidebarActions } = useSidebar();
  const router = useRouter();

  if (!appearance?.mounted) return null;

  const isDark = appearance.isDark;
  const toggleTheme = appearanceActions.toggleTheme;
  const { user } = sidebarState;

  if (!user) return null;

  return (
    <Dropdown>
      <Dropdown.Trigger className="w-full">
        <div
          role="button"
          tabIndex={0}
          className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-content2 transition-all duration-200 group active:scale-[0.98] cursor-pointer outline-none select-none text-foreground"
        >
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar
              src={user.avatar}
              name={user.userName || user.displayName}
              className="w-9 h-9 shrink-0 transition-transform duration-200 group-hover:scale-[1.03]"
            />
            <div className="flex flex-col min-w-0 text-left">
              <span className="font-bold text-[13px] text-foreground truncate leading-tight">
                {user.displayName || user.userName}
              </span>
              {user.userName && (
                <span className="text-[11px] text-muted-foreground truncate mt-0.5 leading-none">
                  @{user.userName}
                </span>
              )}
            </div>
          </div>
          <div className="p-1 rounded-lg transition-colors shrink-0 text-muted-foreground group-hover:text-foreground">
            <MoreHorizontal className="w-5 h-5 transition-transform group-hover:scale-105" />
          </div>
        </div>
      </Dropdown.Trigger>

      <Dropdown.Popover
        placement="top start"
        className="w-[240px] rounded-2xl border border-divider/60 shadow-2xl bg-background/95 backdrop-blur-md p-1.5 mb-2 animate-in fade-in zoom-in-95 duration-200"
      >
        <Dropdown.Menu
          className="outline-none"
          onAction={(key) => {
            if (key === "theme") toggleTheme?.();
            if (key === "logout" || key === "logout-simple")
              sidebarActions.handleLogout();
            if (key === "settings") router.push("/settings");
          }}
        >
          {/* Settings */}
          <Dropdown.Item
            id="settings"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-content2 transition-all cursor-pointer group/item mb-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-muted-foreground/5 group-hover/item:bg-muted-foreground/10 transition-colors">
                <Settings className="w-[18px] h-[18px] text-muted-foreground group-hover/item:text-foreground" />
              </div>
              <span className="font-semibold text-[14px] text-muted-foreground group-hover/item:text-foreground transition-colors">
                {t("settings")}
              </span>
            </div>
          </Dropdown.Item>

          {/* Dark Mode Toggle */}
          <Dropdown.Item
            id="theme"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-content2 transition-all cursor-pointer group/item mb-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-muted-foreground/5 group-hover/item:bg-muted-foreground/10 transition-colors">
                {isDark ? (
                  <Sun className="w-[18px] h-[18px] text-muted-foreground group-hover/item:text-foreground" />
                ) : (
                  <Moon className="w-[18px] h-[18px] text-muted-foreground group-hover/item:text-foreground" />
                )}
              </div>
              <span className="font-semibold text-[14px] text-muted-foreground group-hover/item:text-foreground transition-colors">
                {isDark ? t("lightMode") : t("darkMode")}
              </span>
            </div>
          </Dropdown.Item>

          <Separator className="my-2 border-t border-divider/40 mx-2" />

          <Dropdown.Item
            id="logout"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-danger/10 transition-all cursor-pointer group/danger"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-danger/5 group-hover/danger:bg-danger/10 transition-colors">
                <LogOut className="w-[18px] h-[18px] text-danger" />
              </div>
              <span className="font-bold text-[14px] text-danger">
                {t("logout")}
              </span>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
