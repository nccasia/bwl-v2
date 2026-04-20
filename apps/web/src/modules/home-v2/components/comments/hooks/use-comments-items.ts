import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCommentReplies } from "./use-comments";
import { useAuthStore } from "@/stores/login/auth-store";
import { useGetUser } from "@/modules/shared/hooks/common/use-get-user";
import { Comment } from "@/types/comment/comment";

export function useCommentItem(comment: Comment) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const t = useTranslations("home");

  const { data: repliesResponse, isLoading: isLoadingReplies } = useCommentReplies(comment.id);
  const replies = repliesResponse?.data || [];
  
  const hasReplies = (comment as any)._count?.replies
    ? (comment as any)._count.replies > 0
    : replies.length > 0;

  const currentUser = useAuthStore((state) => state.user);
  const isOwnComment =
    currentUser &&
    (String(comment.authorId).trim().toLowerCase() === String(currentUser.id).trim().toLowerCase() ||
      (comment.author?.id &&
        String(comment.author.id).trim().toLowerCase() === String(currentUser.id).trim().toLowerCase()));

  const { data: fetchedAuthor, isLoading: isAuthorLoading } = useGetUser(
    !isOwnComment ? comment.authorId : undefined,
  );

  const author = isOwnComment
    ? {
        id: currentUser.id,
        avatar: currentUser.avatar,
        username: currentUser.username,
        displayName: currentUser.username,
      }
    : fetchedAuthor || comment.author;

  const authorName = isAuthorLoading ? "..." : author?.username || "Anonymous";

  const handleReplySuccess = () => {
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const toggleReplyInput = () => setShowReplyInput(!showReplyInput);
  const toggleReplies = () => setShowReplies(!showReplies);

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
    },
    handlers: {
      toggleReplyInput,
      toggleReplies,
      handleReplySuccess,
    },
  };
}
