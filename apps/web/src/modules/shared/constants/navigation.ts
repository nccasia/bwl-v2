import {
  Home,
  User,
  Bell,
  Compass,
  Settings,
} from "lucide-react";
import { SidebarItem } from "../types";

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: Home, translationKey: "home", href: "/" },
  { icon: User, translationKey: "profile", href: "/profile" },
  { icon: Bell, translationKey: "notifications", href: "/notifications" },
  { icon: Compass, translationKey: "explore", href: "/explore" },
  { icon: Settings, translationKey: "settings", href: "/settings" },
];
