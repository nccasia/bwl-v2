import { useAuthStore } from "@/stores/login/auth-store";
import { useLoginRequiredStore } from "@/stores/shared/login-required-store";
import { Post } from "@/types/home-v2";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

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

  const router = useRouter();
    const goToProfile = (post: Post) => {
      const identifier = post.author.username || post.author.id;
      router.push(`/profile/${identifier}`);
    };

  const onLike = () => {};

  const onComment = () => {};

  return {
    state: {
      handleActionClick,
      onLike,
      onComment,
      t,
      goToProfile
    },
  };
}