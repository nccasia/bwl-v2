import { authClient } from "@/libs/auth-client";
import { useAuthStore } from "@/stores/login/auth-store";
import { isMezonWebView } from "@/utils/mezon";
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
      const internalId = user.userId || user.id;
      const accessToken = user.accessToken;

      if (
        !isAuthenticated ||
        userStore?.id !== internalId ||
        userStore?.accessToken !== accessToken
      ) {
        setSession({
          id: internalId,
          userName: user.username || user.name,
          email: user.email,
          avatar: user.image ?? undefined,
          accessToken: accessToken
        });
      }
    } else if (isAuthenticated) {
      if (isMezonWebView()) return;
      clearSession();
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
