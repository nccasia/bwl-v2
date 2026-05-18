import { useAuthStore } from "@/stores/login/auth-store";
import { useLoginRequiredStore } from "@/stores/shared/login-required-store";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Post } from "@/types/home-v2";
import { usePostComments } from "../components/comments/hooks/use-comments";
import { useReaction } from "@/modules/shared/hooks/reactions/use-reaction";
import { ReactionTargetType } from "@/types/reaction";
import { useTargetReactions } from "@/modules/shared/hooks/reactions/use-target-reactions";
import { isSameId } from "../../shared/utils/id-utils";

export function usePortCard(post: Post, isInView: boolean = true) {
  const t = useTranslations("home");
  const isAuthenticated = useAuthStore((state) => !!state.user);
  const openLoginRequired = useLoginRequiredStore((state) => state.open);
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const { handleToggleReaction, isLoading: isReacting } = useReaction();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const { data: commentsData } = usePostComments(post.id, {
    enabled: isInView || showComments,
  });

  const loadedCommentsCount = commentsData?.pages.reduce((acc, page) => acc + (page.data?.length || 0), 0) || 0;
  const totalComments = Math.max(
    post.stats?.comments || 0,
    commentsData?.pages[0]?.pagination?.total || 0,
    loadedCommentsCount
  );

  const handleActionClick = (action: () => void) => {
    if (!isAuthenticated) {
      openLoginRequired();
      return;
    }

    action();
  };

  const goToProfile = () => {
    router.push(`/profile/${post.author.id}`);
  };

  const { reactions, isLoading: isLoadingReactions } = useTargetReactions(
    post.id,
    ReactionTargetType.Post,
    isInView,
  );

  const isLiked = hasHydrated
    ? !!reactions.find((r) => isSameId(r.userId, user?.id))
    : false;

  const likesCount =
    !isInView || isLoadingReactions
      ? (post.stats?.likes || 0)
      : (reactions.length || post.stats?.likes || 0);


  const onLike = () => {
    handleToggleReaction(post.id, ReactionTargetType.Post, isLiked);
  };

  const onComment = () => {
    setShowComments(!showComments);
  };

  const authorName = post.author.displayName || post.author.userName;

  return {
    state: {
      showComments,
      totalComments,
      authorName,
      t,
      isLiked,
      likesCount,
      isReacting: isReacting || isLoadingReactions,
    },
    handlers: {
      handleActionClick,
      onLike,
      onComment,
      t,
      goToProfile,
    },
  };
}
