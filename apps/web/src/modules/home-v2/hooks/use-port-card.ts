import { useAuthStore } from "@/stores/login/auth-store";
import { useLoginRequiredStore } from "@/stores/shared/login-required-store";
import { useTranslations } from "next-intl";

export function usePortCard() {
  const t = useTranslations("home");
  const isAuthenticated = useAuthStore((state) => !!state.user);
  const openLoginRequired = useLoginRequiredStore((state) => state.open);

  const handleActionClick = (action: () => void) => {
    if (!isAuthenticated) {
      openLoginRequired();
      return;
    }

    action();
  };

  const onLike = () => {};

  const onComment = () => {};

  return {
    state: {
      handleActionClick,
      onLike,
      onComment,
      t,
    },
  };
}