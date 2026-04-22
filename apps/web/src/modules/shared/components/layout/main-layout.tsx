"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { useNotificationSSE } from "@/modules/notification/hooks/use-notification-sse";

const IGNORED_PATHS = ["/login", "/auth", "/api"];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  useNotificationSSE();

  const shouldShowSidebar = !IGNORED_PATHS.some((path) =>
    pathname?.startsWith(path),
  );

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-[320px]">{children}</main>
    </div>
  );
}
