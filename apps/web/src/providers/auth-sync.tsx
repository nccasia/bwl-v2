import { authClient } from "@/libs/auth-client";
import { useAuthStore } from "@/stores/login/auth-store";
import { useEffect } from "react";
import type { AuthUser } from "@/libs/auth";

const MEZON_SESSION_KEY = "mezon_session";

export function AuthSync() {
  const { data: session, isPending, error } = authClient.useSession();
  const { setSession, clearSession } = useAuthStore();
  const userStore = useAuthStore((state) => state.user);
  const isAuthenticated = !!userStore;

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      const user = session.user as AuthUser;
      const internalId = user.userId || user.id;

      if (!isAuthenticated || userStore?.id !== internalId) {
        setSession({
          id: internalId,
          userName:
            (user as AuthUser & { username?: string }).username || user.name,
          email: user.email || undefined,
          avatar: user.image || undefined,
          accessToken: user.accessToken || undefined,
        });

        if (user.accessToken) {
          localStorage.setItem("accessToken", user.accessToken);
        }
      }
    } else {
      const mezonSessionRaw = localStorage.getItem(MEZON_SESSION_KEY);
      if (mezonSessionRaw) {
        try {
          const mezonUser = JSON.parse(mezonSessionRaw) as {
            id: string;
            userName?: string;
            displayName?: string;
            avatar?: string;
            email?: string;
            accessToken: string;
          };
          if (mezonUser.accessToken && mezonUser.id) {
            if (!isAuthenticated || userStore?.id !== mezonUser.id) {
              setSession({
                id: mezonUser.id,
                userName: mezonUser.userName,
                displayName: mezonUser.displayName,
                avatar: mezonUser.avatar,
                email: mezonUser.email,
                accessToken: mezonUser.accessToken,
              });
            }
            return;
          }
        } catch {
        }
      }

      if (isAuthenticated) {
        clearSession();
        localStorage.removeItem("accessToken");
      }
    }
  }, [
    session,
    isPending,
    error,
    setSession,
    clearSession,
    isAuthenticated,
    userStore,
  ]);

  return null;
}
