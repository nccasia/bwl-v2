import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/login/auth-store";
import { authClient } from "@/libs/auth-client";
import { SIDEBAR_ITEMS } from "@/modules/shared/constants/navigation";

export function useSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("sidebar");
  const { clearSession, user } = useAuthStore();
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          clearSession();
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        },
      },
    });
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const filteredItems = SIDEBAR_ITEMS.filter((item) => {
    if (!isAuthenticated) {
      const secureItems = ["profile", "notifications", "settings"];
      return !secureItems.includes(item.translationKey);
    }
    return true;
  });

  return {
    state: {
      pathname,
      isAuthenticated,
      user,
      filteredItems,
      t,
    },
    actions: {
      handleLogout,
      handleLogin,
    },
  };
}
