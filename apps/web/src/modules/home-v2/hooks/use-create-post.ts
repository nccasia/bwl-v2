import { useAuthStore } from "@/stores/login/auth-store";
import { useCreatePostStore } from "@/stores/post/create-post-store";
import { useTranslations } from "next-intl";

export function useCreatePost() {
  const { isOpen, open } = useCreatePostStore();
  const user = useAuthStore((state) => state.user);
  const t = useTranslations();

  return {
    state: {
        isOpen,
        user,
        t
    },

    actions: {
        open,
    }
  }
}