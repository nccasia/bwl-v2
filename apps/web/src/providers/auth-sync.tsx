import { authClient } from "@/libs/auth-client";
import { useAuthStore } from "@/stores/login/auth-store";
import { useEffect } from "react";
import type { AuthUser } from "@/libs/auth";

export function AuthSync() {
  const { data: session, isPending, error } = authClient.useSession();
  const { setSession, clearSession } = useAuthStore();
  const userStore = useAuthStore((state) => state.user);
  const isAuthenticated = !!userStore;

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      const user = session.user as AuthUser;

      if (!isAuthenticated || userStore?.id !== user.id) {
        setSession({
          id: user.id,
          username: user.name,
          email: user.email || undefined,
          avatar: user.image || undefined,
          accessToken: user.accessToken || undefined,
        });

        if (user.accessToken) {
          localStorage.setItem("accessToken", user.accessToken);
        }
      }
    } else if (isAuthenticated) {
      clearSession();
      localStorage.removeItem("accessToken");
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
