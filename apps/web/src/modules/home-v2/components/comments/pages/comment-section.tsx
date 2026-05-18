"use client";
import { Spinner } from "@heroui/react";
import { CommentInputProps } from "@/types/comment/comment";
import { useCommentsSection } from "../hooks";
import { CommentInput, CommentItem } from "../components";

export function CommentSection({ postId }: CommentInputProps) {
  const { state } = useCommentsSection(postId);
  const {
    t,
    comments,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    infiniteScrollRef,
  } = state;

  return (
    <div className="flex flex-col gap-6 px-6 py-4 border-t border-divider/50 bg-content1/30">
      <CommentInput postId={postId} />

      <div className="flex flex-col gap-6 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner color="accent" size="sm" />
          </div>
        ) : comments.length > 0 ? (
          <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}

            {hasNextPage && (
              <div
                ref={infiniteScrollRef}
                className="min-h-[60px] w-full flex items-center justify-center py-4"
              >
                {isFetchingNextPage ? (
                  <Spinner color="accent" size="sm" />
                ) : (
                  <div className="h-1 w-1 opacity-0" />
                )}
              </div>
            )}
            {!hasNextPage && comments.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/60 py-6 italic font-medium">
                {t("noMoreComments")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8 font-medium">
            {t("noCommentsYet")}
          </p>
        )}
      </div>
    </div>
  );
}
