"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { useNotificationSSE } from "@/modules/notification/hooks/use-notification-sse";
import { Spinner } from "@heroui/react";
import { useMezonContext } from "@/libs/mezon";

const IGNORED_PATHS = ["/login", "/auth", "/api"];

interface MainLayoutProps {
  children: React.ReactNode;
}

function MezonAutoLoginOverlay() {
  const { autoLoginStatus, autoLoginError, retryAutoLogin } = useMezonContext();

  if (autoLoginStatus === "loading") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-default-500">Signing in with Mezon…</p>
        </div>
      </div>
    );
  }

  if (autoLoginStatus === "error") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <p className="text-sm text-danger">{autoLoginError ?? "Authentication failed."}</p>
          <button
            onClick={retryAutoLogin}
            className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold transition-transform active:scale-95 hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  useNotificationSSE();

  const shouldShowSidebar = !IGNORED_PATHS.some((path) =>
    pathname?.startsWith(path),
  );

  if (!shouldShowSidebar) {
    return (
      <>
        <MezonAutoLoginOverlay />
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MezonAutoLoginOverlay />
      <Sidebar />
      <main className="flex-1 mx-auto">{children}</main>
    </div>
  );
}
