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

export function usePortCard(post: Post) {
  const t = useTranslations("home");
  const isAuthenticated = useAuthStore((state) => !!state.user);
  const openLoginRequired = useLoginRequiredStore((state) => state.open);
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const { handleToggleReaction, isLoading: isReacting } = useReaction();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

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

  const { reactions, isLoading: isLoadingReactions } = useTargetReactions(post.id, ReactionTargetType.Post);

  const isLiked = hasHydrated 
    ? !!reactions.find((r) => isSameId(r.userId, user?.id))
    : false;
    
  const likesCount = reactions.length;

  const onLike = () => {
    handleToggleReaction(post.id, ReactionTargetType.Post, isLiked);
  };

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
      isLiked,
      likesCount,
      isReacting: isReacting || isLoadingReactions,
    },
    handlers: {
      handleActionClick,
      onLike,
      onComment,
      t,
      goToProfile
    },
  };
}