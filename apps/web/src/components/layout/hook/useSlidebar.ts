"use client";

import { usePathname } from "next/navigation";
import { Home, User, Bell, Search, LogOut, Settings } from "lucide-react";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { useNotificationContext } from "@/components/notifications/NotificationContext";
import { useTranslations } from "next-intl";

interface SidebarProps {
  user?: AuthUser | null;
}

export function useSlideBar({user: userProp}: SidebarProps) {
     const pathname = usePathname();
      const { unread } = useNotificationContext();
      const { logout, user: authUser } = useAuth();
      const t = useTranslations("slidebar");
      const user = userProp || authUser;

      const navItems = [
    { path: "/", icon: Home, label: t("home") },
    { path: user?.username ? `/profile/${user.username}` : "/login", icon: User, label: t("profile") },
    { path: "/notifications", icon: Bell, label: t("notifications") },
    { path: "/explore", icon: Search, label: t("explore") },
    { path: "/settings", icon: Settings, label: t("settings") },
    { path: "logout", icon: LogOut, label: t("logout") },
  ];

   const handleLogout = () => {
    logout();
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  return {
    state: {
        pathname,
        unread,
        user,
        navItems,
    },
    actions: {
        handleLogout,
    }
  }
}