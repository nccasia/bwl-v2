import {
  Home,
  User,
  Bell,
  // Compass, // TODO: restore when Explore is ready
  Settings,
} from "lucide-react";
import { SidebarItem } from "../types";

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: Home, translationKey: "home", href: "/" },
  { icon: User, translationKey: "profile", href: "/profile" },
  { icon: Bell, translationKey: "notifications", href: "/notifications" },
  // { icon: Compass, translationKey: "explore", href: "/explore" }, // TODO: restore when Explore is ready
  { icon: Settings, translationKey: "settings", href: "/settings" },
];
