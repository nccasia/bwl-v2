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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 group/comment">
        <UserAvatar
          src={state.author?.avatar}
          name={state.authorName}
          className="w-8 h-8 shrink-0"
        />
        <div className="flex-1 flex flex-col gap-1">
          <div className="bg-content3/50 px-3 py-2 rounded-2xl group-hover/comment:bg-content3/80 transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm hover:underline cursor-pointer">
                {state.authorName}
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
              onClick={handlers.onLike}
              disabled={state.isReacting}
            >
              <Heart
                size={14}
                className={state.isLiked ? "fill-current" : "fill-none"}
              />
              {state.likesCount > 0 && <span>{state.likesCount}</span>}
              {state.t("like")}
            </button>

            {state.canReply && (
              <button
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={handlers.toggleReplyInput}
              >
                {state.t("reply")}
              </button>
            )}

            {state.hasReplies && (
              <button
                className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                onClick={handlers.toggleReplies}
              >
                {state.showReplies ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {state.showReplies
                  ? state.t("hideReplies")
                  : state.t("viewMoreReplies", {
                      count: comment._count?.replies || state.replies.length,
                    })}
              </button>
            )}
          </div>
        </div>
      </div>

      {state.showReplyInput && (
        <div className="pl-11 pr-4">
          <CommentInput
            postId={comment.postId}
            parentId={state.targetParentId ?? undefined}
            replyToUserId={state.replyToUserId}
            initialValue={state.initialReplyValue}
            placeholder={state.t("writeAReply")}
            autoFocus
            onSuccess={handlers.handleReplySuccess}
          />
        </div>
      )}

      {state.canShowReplies && state.showReplies && (
        <div className="pl-11 flex flex-col gap-4 border-l-2 border-divider/30 ml-4 py-2">
          {state.isLoadingReplies ? (
            <div className="text-xs text-muted-foreground animate-pulse px-4">
              {state.t("loading")}
            </div>
          ) : (
            state.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
