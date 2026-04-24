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
    <div
      className="flex flex-col h-full bg-white border-l"
      style={{ borderColor: "#f3f4f6" }}
    >
      <div
        className="flex items-center gap-3 px-4 py-4 border-b shrink-0"
        style={{ borderColor: "#f3f4f6" }}
      >
        <UserAvatar
          src={authorAvatar}
          name={authorName}
          className="w-10 h-10 shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-gray-900 truncate">
            {authorName}
          </span>
          {userName && (
            <span className="text-[10px] text-gray-500 truncate">
              @{userName}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {post.content && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "#f3f4f6" }}>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
      >
        {commentsState.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner color="accent" size="sm" />
          </div>
        ) : commentsState.comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-10">
            <MessageCircle size={32} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">
              Chưa có bình luận nào
            </p>
            <p className="text-xs text-gray-300">
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
            {!commentsState.hasNextPage && commentsState.comments.length > 0 && (
              <p className="text-center text-[10px] text-muted-foreground/60 py-6 italic font-medium">
                {commentsState.t("noMoreComments")}
              </p>
            )}
          </>
        )}
      </div>

      <div
        className="px-4 py-4 border-t shrink-0 bg-white"
        style={{ borderColor: "#f3f4f6" }}
      >
        <CommentInput
          postId={post.id}
          placeholder="Viết bình luận..."
        />
      </div>
    </div>
  );
}
