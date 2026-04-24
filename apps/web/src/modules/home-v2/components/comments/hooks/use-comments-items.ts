import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useCommentReplies } from "./use-comments";
import { useAuthStore } from "@/stores/login/auth-store";
import { useGetUser } from "@/modules/shared/hooks/common/use-get-user";
import { Comment } from "@/types/comment/comment";
import { useReaction } from "@/modules/shared/hooks/reactions/use-reaction";
import { ReactionTargetType } from "@/types/reaction";
import { useTargetReactions } from "@/modules/shared/hooks/reactions/use-target-reactions";
import { isSameId } from "../../../../shared/utils/id-utils";
import { useCommentStore } from "../stores/comment-store";

export function useCommentItem(comment: Comment) {
  const t = useTranslations("home");
  const { setActiveReplyId, getActiveReplyId } = useCommentStore();
  const { user: currentUser, hasHydrated } = useAuthStore();

  const isLevel1 = !comment.parentId;
  const showReplyInput = getActiveReplyId(comment.postId) === comment.id;
  const [showReplies, setShowReplies] = useState(false);

  const { data: repliesResponse, isLoading: isLoadingReplies } = useCommentReplies(isLevel1 ? comment.id : "");
  const replies = useMemo(() => repliesResponse?.data ?? [], [repliesResponse]);
  const hasReplies = isLevel1 && (comment._count?.replies ? comment._count.replies > 0 : replies.length > 0);

  const isOwnComment = useMemo(() =>
    hasHydrated && currentUser && isSameId(comment.authorId, currentUser.id),
    [comment.authorId, currentUser, hasHydrated]
  );

  const { data: fetchedAuthor, isLoading: isAuthorLoading } = useGetUser(
    !comment.author && !isOwnComment ? comment.authorId : undefined
  );

  const author = useMemo(() => {
    if (comment.author) return comment.author;
    if (isOwnComment) return currentUser;
    return fetchedAuthor ?? null;
  }, [comment.author, isOwnComment, currentUser, fetchedAuthor]);

  const authorName = useMemo(() => {
    if (isAuthorLoading) return "...";
    return author?.userName;
  }, [isAuthorLoading, author]);

  const targetParentId = isLevel1 ? comment.id : comment.parentId;
  const initialReplyValue = !isLevel1 ? `@${authorName} ` : "";

  const { handleToggleReaction, isLoading: isReacting } = useReaction();
  const { reactions, isLoading: isLoadingReactions } = useTargetReactions(comment.id, ReactionTargetType.Comment);

  const isLiked = useMemo(() =>
    hasHydrated && !!currentUser && !!reactions.find((r) => isSameId(r.userId, currentUser.id)),
    [hasHydrated, currentUser, reactions]
  );

  const likesCount = reactions.length;

  const onLike = useCallback(() => {
    handleToggleReaction(comment.id, ReactionTargetType.Comment, isLiked);
  }, [comment.id, isLiked, handleToggleReaction]);

  const handleReplySuccess = useCallback(() => {
    setActiveReplyId(comment.postId, null);
    setShowReplies(true);
  }, [comment.postId, setActiveReplyId]);

  const toggleReplyInput = useCallback(() => {
    setActiveReplyId(comment.postId, showReplyInput ? null : comment.id);
  }, [comment.postId, comment.id, showReplyInput, setActiveReplyId]);

  const toggleReplies = useCallback(() => setShowReplies(prev => !prev), []);

  return {
    state: {
      t,
      showReplyInput,
      showReplies,
      replies,
      hasReplies,
      isLoadingReplies,
      author,
      authorName,
      isAuthorLoading,
      isLiked,
      likesCount,
      isReacting: isReacting || isLoadingReactions,
      canReply: true,
      canShowReplies: isLevel1,
      targetParentId,
      replyToUserId: comment.authorId,
      initialReplyValue,
    },
    handlers: {
      toggleReplyInput,
      toggleReplies,
      handleReplySuccess,
      onLike,
    },
  };
}



