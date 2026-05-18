"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Dropdown, Separator } from "@heroui/react";
import { Settings, Moon, Sun, LogOut, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppearanceSection } from "@/modules/settings/hooks";
import { useSidebar } from "@/modules/shared/hooks/slide-bar/use-sidebar";

export function UserProfileDropdown() {
  const t = useTranslations("sidebar");
  const { state: appearance, actions: appearanceActions } =
    useAppearanceSection();
  const { actions: sidebarActions } = useSidebar();
  const router = useRouter();

  if (!appearance?.mounted) return null;

  const isDark = appearance.isDark;
  const toggleTheme = appearanceActions.toggleTheme;

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div
          role="button"
          tabIndex={0}
          className="w-full flex items-center justify-start gap-3 px-3 py-6 rounded-xl text-muted-foreground hover:text-foreground font-bold text-[15px] border-none hover:bg-content2 transition-all group active:scale-[0.98] cursor-pointer outline-none"
        >
          <div className="p-1.5 rounded-lg bg-muted-foreground/10 group-hover:bg-brand-start/15 transition-all shrink-0">
            <Menu className="w-[20px] h-[20px] group-hover:text-brand-start transition-colors" />
          </div>
          <span className="tracking-tight">{t("more")}</span>
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
