import {
  MessageCircle,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { useImageViewer } from "../hooks/use-image-viewer";
import { useCommentsSection } from "@/modules/home-v2/components/comments/hooks/use-comments-section";
import { CommentItem, CommentInput } from "@/modules/home-v2/components/comments/components";
import { Spinner } from "@heroui/react";

dayjs.extend(relativeTime);

export function CommentSidebar() {
  const { state: viewerState } = useImageViewer();
  const post = viewerState.post;

  const { state: commentsState } = useCommentsSection(post?.id || "");

  if (!post) return null;

  const authorName = post.author.displayName || post.author.userName || "User";
  const userName = post.author.userName;
  const authorAvatar = post.author.avatar;
  return (
    <div className="flex flex-col h-full bg-background border-l border-divider">
      {/* Author header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-divider shrink-0">
        <UserAvatar
          src={authorAvatar}
          name={authorName}
          className="w-10 h-10 shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-foreground truncate">
            {authorName}
          </span>
          {userName && (
            <span className="text-[10px] text-muted-foreground truncate">
              @{userName}
            </span>
          )}
          <span className="text-xs text-muted-foreground/70">
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Post content */}
      {post.content && (
        <div className="px-4 py-3 border-b border-divider">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}

      {/* Comments list */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--heroui-divider) transparent",
        }}
      >
        {commentsState.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner color="accent" size="sm" />
          </div>
        ) : commentsState.comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-10">
            <MessageCircle size={32} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">
              Chưa có bình luận nào
            </p>
            <p className="text-xs text-muted-foreground/60">
              Hãy là người đầu tiên bình luận!
            </p>
          </div>
        ) : (
          <>
            {commentsState.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}

            {commentsState.hasNextPage && (
              <div
                ref={commentsState.infiniteScrollRef}
                className="min-h-[60px] w-full flex items-center justify-center py-4"
              >
                {commentsState.isFetchingNextPage ? (
                  <Spinner color="accent" size="sm" />
                ) : (
                  <div className="h-1 w-1 opacity-0" />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Comment input */}
      <div className="px-4 py-4 border-t border-divider shrink-0 bg-background">
        <CommentInput
          postId={post.id}
          placeholder="Viết bình luận..."
        />
      </div>
    </div>
  );
}
