"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth, getUser } from "@/hooks/useAuth";
import { NotificationProvider } from "@/components/notifications/NotificationContext";

const PUBLIC_ROUTES = ["/login", "/loading"];

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));

  const checkAndRedirect = useCallback(() => {
    const isPublic = PUBLIC_ROUTES.some((route) => window.location.pathname.startsWith(route));
    if (!isPublic && !getUser()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    if (!isPublicRoute && !user) {
      router.replace("/login");
    }
  }, [ready, user, isPublicRoute, router]);

  useEffect(() => {
    window.addEventListener("popstate", checkAndRedirect);

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) checkAndRedirect();
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("popstate", checkAndRedirect);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [checkAndRedirect]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <NotificationProvider userId={user.username || user.sub || user.displayName}>
      <div className="min-h-screen flex bg-background text-foreground">
        <Sidebar user={user} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}
