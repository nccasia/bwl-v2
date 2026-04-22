"use client";

import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { CommentItemProps } from "@/types/comment/comment";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useCommentItem } from "../hooks";
import { CommentInput } from "./";
dayjs.extend(relativeTime);

export function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const { state, handlers } = useCommentItem(comment);
  const {
    t,
    showReplyInput,
    showReplies,
    replies,
    hasReplies,
    isLoadingReplies,
    author,
    authorName,
  } = state;

  const { toggleReplyInput, toggleReplies, handleReplySuccess, onLike } = handlers;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 group/comment">
        <UserAvatar
          src={author?.avatar}
          name={author?.username || "User"}
          className="w-8 h-8 shrink-0"
        />
        <div className="flex-1 flex flex-col gap-1">
          <div className="bg-content3/50 px-3 py-2 rounded-2xl group-hover/comment:bg-content3/80 transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm hover:underline cursor-pointer">
                {authorName}
              </span>
              <span className="text-muted-foreground/60 text-[10px]">
                {dayjs(comment.createdAt).fromNow()}
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-foreground/90">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 px-1">
            <button
              className={`text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${state.isLiked ? "text-danger" : "text-muted-foreground hover:text-foreground"}`}
              onClick={onLike}
              disabled={state.isReacting}
            >
              <Heart
                size={14}
                className={state.isLiked ? "fill-current" : "fill-none"}
              />
              {state.likesCount > 0 && <span>{state.likesCount}</span>}
              {t("like")}
            </button>

            <button
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={toggleReplyInput}
            >
              {t("reply")}
            </button>

            {hasReplies && (
              <button
                className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                onClick={toggleReplies}
              >
                {showReplies ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {showReplies
                  ? t("hideReplies")
                  : t("viewMoreReplies", {
                      count: (comment as any)._count?.replies || replies.length,
                    })}
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyInput && (
        <div className="pl-11 pr-4">
          <CommentInput
            postId={comment.postId}
            parentId={comment.id}
            placeholder={t("writeAReply")}
            autoFocus
            onSuccess={handleReplySuccess}
          />
        </div>
      )}

      {showReplies && (
        <div className="pl-11 flex flex-col gap-4 border-l-2 border-divider/30 ml-4 py-2">
          {isLoadingReplies ? (
            <div className="text-xs text-muted-foreground animate-pulse px-4">
              {t("loading")}
            </div>
          ) : (
            replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
