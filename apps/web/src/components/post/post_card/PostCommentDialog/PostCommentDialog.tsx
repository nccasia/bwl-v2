"use client"

import { useEffect, useRef, useState } from "react"
import {
  ThumbsUp, Download, SendHorizontal
} from "lucide-react"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/UserAvatar"

import { EmojiPicker } from "../EmojiPicker"

import { handleAddComment as handleAddCommentLogic, downloadAllImages, PostCommentDialogProps } from "./types/PostCommentDialog.type"
import { usePostComments } from "../hook/usePostComments"
import { REACTION_MAP } from "@/utils/constants/reactions"
import { CommentList } from "@/components/comments/comment_list/CommentList"

export function PostCommentDialog({
  post,
  currentUser,
  open,
  onOpenChange,
  onReact,
  myEmoji,
  comments,
  setComments,
  reactions,
  setReactions,
  setTotalLike,
  disableSse = false,
}: PostCommentDialogProps) {


  const {
    loading,
    fetchComments,
    fetchReactions,
    addComment,
    reactToComment,
  } = usePostComments({ postId: post?.id ?? "", open, comments, setComments, reactions, setReactions, setTotalLike })


  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [newCommentId, setNewCommentId] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const pickerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeReaction = myEmoji
    ? REACTION_MAP[myEmoji]
    : { label: "Thích", color: "text-muted-foreground" }

  useEffect(() => {
    if (open && post?.id) {
      fetchComments()
      fetchReactions()
      setNewCommentId(null)
    }
  }, [open, post?.id])

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showPicker])

  useEffect(() => {
    if (!open || !post?.id || disableSse) return
    const BE_URL = process.env.NEXT_PUBLIC_API_URL
    const es = new EventSource(`${BE_URL}/bwl/${post.id}/comments/stream`)
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg?.type === 'ping') return
        if (msg.type === 'reaction') {
          const data = msg.data
          setReactions(data)
          setTotalLike(Object.values(data as Record<string, string[]>).reduce((s, v) => s + v.length, 0))
        }
        if (msg.type === 'comment') {
          const incoming = msg.data
          setComments(prev => prev.some(c => c._id === incoming._id) ? prev : [...prev, incoming])
        }
        if (msg.type === 'delete_comment') {
          setComments(prev => prev.filter(c => c._id !== msg.data.commentId))
        }
        if (msg.type === 'update_comment') {
          setComments(prev => prev.map(c => c._id === msg.data._id ? { ...c, reactions: msg.data.reactions } : c))
        }
      } catch { }
    }
    return () => es.close()
  }, [open, post?.id])

  useEffect(() => {
    if (!commentText && textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [commentText])




  const handleAddComment = async () => {
    const saved = await handleAddCommentLogic({
      currentUser: currentUser?.username ? { username: currentUser.username, avatar: currentUser.avatar } : undefined,
      commentText,
      addComment,
      setSubmitting,
      setCommentText
    })
    if (saved) {
      setNewCommentId(saved._id)
    }
  }

  const handleDownloadAll = async () => {
    if (!post) return
    await downloadAllImages(post)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[90vw] p-0 flex flex-col h-[90vh] gap-0">
        <DialogHeader className="px-5 py-4 border-b flex-row items-center justify-between">
          <div className="flex-1" />
          <DialogTitle className="text-lg font-bold flex items-center gap-2 justify-center flex-1">
            {post ? (
              <>
                <UserAvatar
                  name={post.authorId}
                  avatarUrl={post.authorAvatar ?? undefined}
                  size="sm"
                />
                <span>Bài viết của {post.authorDisplayName || post.authorId}</span>
              </>
            ) : (
              <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            )}
          </DialogTitle>
          <div className="flex-1" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-secondary/10">


          <div className="relative w-full bg-black flex justify-center items-center min-h-[400px] h-[50vh] sm:h-[60vh] max-h-[70vh] overflow-hidden group">
            {!post ? (
              <div className="w-full h-full bg-muted animate-pulse" />
            ) : post.images[0] ? (
              <>
                <img
                  src={post.images[0]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 pointer-events-none transition-opacity duration-700"
                />

                <img
                  src={post.images[0]}
                  alt="Post content"
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl shadow-black/50 transition-transform duration-500"
                />
              </>
            ) : null}
          </div>

          <div className="px-4 py-3 flex justify-between items-center border-b mx-4 text-helvetica-neue text-[15px]">
            <div className="flex items-center gap-2">
              <div className="flex items-center ">
                {Object.entries(reactions ?? {})
                  .filter(([, u]) => u.length > 0)
                  .map(([emoji]) => (
                    <span key={emoji} className="-ml-1.5 first:ml-0 bg-background rounded-full border border-border shadow-sm w-6 h-6 flex items-center justify-center text-[15px]">
                      {emoji}
                    </span>
                  ))}
              </div>
              <span className="font-medium text-muted-foreground ml-1">
                {Object.values(reactions ?? {}).reduce((s, v) => s + v.length, 0)}
              </span>
            </div>

            <div className="text-muted-foreground hover:underline cursor-pointer">
              {(comments ?? []).length} bình luận
            </div>
          </div>

          <div className="px-4 py-2 flex border-b mx-4 mb-4">

            <div
              className="relative flex-1"
              ref={pickerRef}
              onMouseLeave={() => setShowPicker(false)}
            >
              {showPicker && (
                <EmojiPicker
                  onPick={(e) => {
                    setShowPicker(false)
                    onReact?.(e)
                    setTimeout(fetchReactions, 300)
                  }}
                />
              )}

              <Button
                variant="ghost"
                className={`w-full gap-2 ${activeReaction.color}`}
                onMouseEnter={() => setShowPicker(true)}
                onClick={() => {
                  onReact?.(myEmoji || "👍")
                  setTimeout(fetchReactions, 300)
                }}
              >
                {myEmoji ?? <ThumbsUp className="w-5 h-5" />}
                {activeReaction.label}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="flex-1 gap-2"
              onClick={handleDownloadAll}
            >
              <Download className="w-5 h-5" />
              Tải ảnh
            </Button>
          </div>

          <div className="px-6 pb-4">
            <CommentList
              comments={comments}
              loading={loading}
              currentUserId={currentUser?.username}
              currentUserAvatar={currentUser?.avatar ?? undefined}
              newCommentId={newCommentId}
              onReactToComment={(commentId, emoji) => reactToComment(commentId, currentUser?.username ?? "anonymous", emoji)}
              onReply={async (topLevelParentId, replyToAuthorId, content) => {
                if (!currentUser) return
                const saved = await addComment(
                  currentUser.username ?? "",
                  `@${replyToAuthorId} ${content}`,
                  topLevelParentId,
                  currentUser.avatar ?? null
                )
                if (saved) setNewCommentId(saved._id)
              }}
            />
            <div ref={bottomRef} />
          </div>
        </div>
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2 items-start bg-muted rounded-2xl p-2">
            <UserAvatar
              name={currentUser?.username || "Guest"}
              avatarUrl={currentUser?.avatar}
              size="sm"
            />
            <div className="flex-1 flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onInput={e => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = `${target.scrollHeight}px`
                }}
                onKeyDown={e =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), handleAddComment())
                }
                placeholder="Viết bình luận..."
                className="flex-1 bg-transparent outline-none text-[18px] placeholder:text-muted-foreground/60 resize-none overflow-hidden max-h-[150px] leading-tight py-1"
                disabled={submitting}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || submitting}
                className="shrink-0"
              >
                <SendHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}