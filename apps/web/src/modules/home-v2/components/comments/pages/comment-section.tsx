"use client";

import { Spinner, Button } from "@heroui/react";
import { CommentInputProps } from "@/types/comment/comment";
import { useCommentsSection } from "../hooks";
import { CommentInput, CommentItem } from "../components";

export function CommentSection({ postId }: CommentInputProps) {
  const { state, handlers } = useCommentsSection(postId);

  return (
    <div className="flex flex-col gap-6 px-6 py-4 border-t border-divider/50 bg-content1/30">
      <CommentInput postId={postId} />

      <div className="flex flex-col gap-6 mt-4">
        {state.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner color="accent" size="sm" />
          </div>
        ) : state.comments.length > 0 ? (
          <>
            <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {state.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>

            {state.hasNextPage && (
              <Button
                variant="secondary"
                size="sm"
                onPress={() => handlers.fetchNextPage()}
                isPending={state.isFetchingNextPage}
                className="w-full text-xs font-bold text-muted-foreground hover:text-foreground mt-2"
              >
                {state.t("viewMore")}
              </Button>
            )}
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8 font-medium">
            {state.t("noCommentsYet")}
          </p>
        )}
      </div>
    </div>
  );
}
