import { useAuthStore } from "@/stores/login/auth-store";
import { useLoginRequiredStore } from "@/stores/shared/login-required-store";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Post } from "@/types/home-v2";
import { usePostComments } from "../components/comments/hooks/use-comments";

export function usePortCard(post: Post) {
  const t = useTranslations("home");
  const isAuthenticated = useAuthStore((state) => !!state.user);
  const openLoginRequired = useLoginRequiredStore((state) => state.open);
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);

  const { data: commentsData } = usePostComments(post.id);
  const totalComments =
    commentsData?.pages.reduce(
      (acc, page) => acc + (page.data?.length || 0),
      0,
    ) ?? post.stats.comments;

  const handleActionClick = (action: () => void) => {
    if (!isAuthenticated) {
      openLoginRequired();
      return;
    }

    action();
  };

  const goToProfile = () => {
    const identifier = post.author.username || post.author.id;
    router.push(`/profile/${identifier}`);
  };

  const onLike = () => {};

  const onComment = () => {
    setShowComments(!showComments);
  };

  const authorName = post.author.displayName || post.author.username;

  return {
    state: {
      showComments,
      totalComments,
      authorName,
      t,
    },
    handlers: {
      handleActionClick,
      onLike,
      onComment,
      goToProfile,
    },
  };
}