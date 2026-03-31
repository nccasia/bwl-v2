import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Post, timeAgo, BE_URL, Reactions, Comment } from "@/types/gallery";
import { UserAvatar } from "@/components/UserAvatar";
import { AuthUser } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { EmojiPicker } from "../post/post_card/EmojiPicker";
import { PostCommentDialog } from "../post/post_card/PostCommentDialog/PostCommentDialog";
import Link from "next/link";

interface PostCardProps {
  post: Post;
  currentUser?: AuthUser | null;
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const [reactions, setReactions] = useState<Reactions>({});
  const [showPicker, setShowPicker] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalLike, setTotalLike] = useState(post.totalLike);
  const [commentCount, setCommentCount] = useState(post.totalComment);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  const processedCommentIds = useRef<Set<string>>(new Set());

  const authorName = post.authorDisplayName ?? post.authorId;
  const displayTime = timeAgo(post.createdTimestamp);
  const mainImage = post.images[0];

  useEffect(() => {
    fetch(`${BE_URL}/bwl/${post.id}/reactions`)
      .then(r => r.ok ? r.json() : {})
      .then(setReactions)
      .catch(() => { });
  }, [post.id]);

  useEffect(() => {
    let es: EventSource | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !es) {
          fetch(`${BE_URL}/bwl/${post.id}/reactions`)
            .then(r => r.ok ? r.json() : null)
            .then((data: Reactions | null) => {
              if (data) {
                setReactions(data);
                setTotalLike(Object.values(data).reduce((s, v) => s + v.length, 0));
              }
            })
            .catch(() => { });

          es = new EventSource(`${BE_URL}/bwl/${post.id}/comments/stream`);
          es.onmessage = (ev) => {
            try {
              const msg = JSON.parse(ev.data);
              if (msg?.type === 'ping') return;
              if (msg.type === 'reaction') {
                const data: Reactions = msg.data;
                setReactions(data);
                setTotalLike(Object.values(data).reduce((s, v) => s + v.length, 0));
              }
              if (msg.type === 'comment') {
                const raw = msg.data;
                const incoming: Comment = {
                  ...raw,
                  _id: typeof raw._id === 'object' ? (raw._id?.$oid ?? String(raw._id)) : String(raw._id),
                };
                if (processedCommentIds.current.has(incoming._id)) return;
                processedCommentIds.current.add(incoming._id);
                setTimeout(() => processedCommentIds.current.delete(incoming._id), 10_000);
                setComments(prev => {
                  if (prev.some(c => c._id === incoming._id)) return prev;
                  return [...prev, incoming];
                });
                setCommentCount(c => c + 1);
              }
              if (msg.type === 'delete_comment') {
                setComments(prev => prev.filter(c => c._id !== msg.data.commentId));
                setCommentCount(c => Math.max(0, c - 1));
              }
              if (msg.type === 'update_comment') {
                const updated: Comment = msg.data;
                setComments(prev => prev.map(c => c._id === updated._id ? { ...c, reactions: updated.reactions } : c));
              }
            } catch { /* ignore */ }
          };
        } else if (!entry.isIntersecting && es) {
          es.close();
          es = null;
        }
      },
      { threshold: 0.1 }
    );
    if (articleRef.current) observer.observe(articleRef.current);
    return () => {
      observer.disconnect();
      es?.close();
    };
  }, [post.id]);

  const handleReact = async (emoji: string) => {
    setShowPicker(false);
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    const myEmoji = Object.entries(reactions).find(([, users]) => users.includes(currentUser.username!))?.[0];
    const isToggleOff = myEmoji === emoji;

    try {
      const res = await fetch(`${BE_URL}/bwl/${post.id}/reactions`, {
        method: isToggleOff ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isToggleOff
            ? { userId: currentUser.username! }
            : { userId: currentUser.username!, emoji }
        ),
      });
      if (res.ok) setReactions(await res.json());
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  const hasReactions = Object.values(reactions).some(users => users.length > 0);
  const myEmoji = currentUser
    ? Object.entries(reactions).find(([, users]) => users.includes(currentUser.username!))?.[0]
    : null;

  return (
    <article ref={articleRef} className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden hover:border-brand/30 transition-all">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.authorId}`}>
            <UserAvatar
              name={authorName}
              avatarUrl={post.authorAvatar ?? undefined}
              size="lg"
              className="border-2 border-brand/50 hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          <div>
            <Link href={`/profile/${post.authorId}`}>
              <h4 className="text-foreground font-semibold hover:text-brand transition-colors cursor-pointer">{authorName}</h4>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{displayTime}</span>
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
        </button>
      </div>

      {/* Post Image */}
      {mainImage && (
        <div className="px-8 pb-4">
          <img
            src={mainImage}
            alt="Post content"
            className="w-full rounded-xl object-cover max-h-[600px] cursor-pointer"
            onClick={() => setShowCommentDialog(true)}
          />
        </div>
      )}

      {post.caption && (
        <div className="px-6 pb-2">
          <p className="text-sm">
            <span className="font-semibold mr-1">{post.authorDisplayName ?? authorName}</span>
            {post.caption}
          </p>
        </div>
      )}

      {(() => {
        const mezonTotal = Object.values(post.mezonReactions ?? {}).reduce((s, users) => s + users.length, 0);
        const mezonUsers = [...new Set(Object.values(post.mezonReactions ?? {}).flat())];
        if (mezonTotal === 0) return null;
        return (
          <div className="px-6 pb-2">
            <div className="text-xs text-muted-foreground" title={mezonUsers.join(', ')}>
              💬 {mezonTotal} react trên Mezon {mezonUsers.length > 0 && `(${mezonUsers.slice(0, 3).join(', ')}${mezonUsers.length > 3 ? ` +${mezonUsers.length - 3}` : ''})`}
            </div>
          </div>
        );
      })()}

      {/* Reactions List (Top of Actions) */}
      {hasReactions && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {Object.entries(reactions)
            .filter(([, users]) => users.length > 0)
            .map(([emoji, users]) => {
              const isMine = currentUser && users.includes(currentUser.username!);
              return (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-sm
                    ${isMine
                      ? "bg-brand/20 border-brand/50 text-brand"
                      : "bg-muted border-border text-muted-foreground hover:bg-accent/50"
                    }`}
                >
                  <span className="text-lg leading-none">{emoji}</span>
                  <span className="font-semibold">{users.length}</span>
                </button>
              );
            })}
        </div>
      )}

      {/* Post Actions */}
      <div className="px-8 py-3 border-t gap-4 border-border flex items-center ">
        <div className="flex items-center gap-1">
          <div
            className="relative"
            ref={pickerRef}
            onMouseLeave={() => {
              if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current);
              setShowPicker(false);
            }}
          >
            {showPicker && <EmojiPicker onPick={handleReact} />}
            <button
              onMouseEnter={() => {
                pickerTimerRef.current = setTimeout(() => setShowPicker(true), 500);
              }}
              onClick={() => myEmoji ? handleReact(myEmoji) : handleReact("❤️")}
              className="flex items-center gap-2 text-muted-foreground hover:text-brand transition-colors group"
            >
              <div className="transition-transform hover:scale-110 active:scale-90 cursor-pointer">
                {myEmoji ? (
                  <span className="text-xl leading-none">{myEmoji}</span>
                ) : (
                  <Heart className={`w-6 h-6 ${hasReactions ? "text-brand" : ""}`} />
                )}
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowCommentDialog(true)}
          className="flex items-center gap-2 text-muted-foreground hover:text-brand transition-colors group"
        >
          <div className="transition-transform hover:scale-110 active:scale-90 cursor-pointer">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold">{commentCount}</div>
        </button>
      </div>

      <PostCommentDialog
        post={post}
        currentUser={currentUser}
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        onReact={handleReact}
        myEmoji={myEmoji}
        comments={comments}
        setComments={setComments}
        reactions={reactions}
        setReactions={setReactions}
        setTotalLike={setTotalLike}
      />
    </article>
  );
}
