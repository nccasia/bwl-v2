"use client"

import { useEffect, useState, useRef } from "react"
import { MessageCircle, Trash2, Send, X, Heart, User, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthUser } from "@/hooks/useAuth"

const BE_URL = process.env.NEXT_PUBLIC_API_URL

interface Comment {
  _id: string
  messageId: string
  authorId: string
  content: string
  createdTimestamp: number
}

interface Post {
  id: string
  images: string[]
  authorId: string
  channelId: string
  createdTimestamp: number
  totalLike: number
  totalComment: number
}

interface PostDetailDialogProps {
  post: Post | null
  user: AuthUser | null
  onClose: () => void
  onLikeToggle?: (postId: string) => void
}

export function PostDetailDialog({ post, user, onClose, onLikeToggle }: PostDetailDialogProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [currentImg, setCurrentImg] = useState(0)
  const [reactions, setReactions] = useState<Record<string, string[]>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!post) return
    setCurrentImg(0)
    setComments([])
    setCommentText("")
    setReactions({})
    fetchComments(post.id)
    fetchReactions(post.id)
  }, [post?.id])

  const fetchComments = async (postId: string) => {
    setLoadingComments(true)
    try {
      const res = await fetch(`${BE_URL}/bwl/${postId}/comments`)
      if (res.ok) setComments(await res.json())
    } catch { /* ignore */ } finally {
      setLoadingComments(false)
    }
  }

  const fetchReactions = async (postId: string) => {
    try {
      const res = await fetch(`${BE_URL}/bwl/${postId}/reactions`)
      if (res.ok) setReactions(await res.json())
    } catch { /* ignore */ }
  }

  const handleAddComment = async () => {
    if (!post || !user || !commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${BE_URL}/bwl/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.username, content: commentText.trim() }),
      })
      if (res.ok) {
        const saved: Comment = await res.json()
        setComments(prev => [...prev, saved])
        setCommentText("")
      }
    } catch { /* ignore */ } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!post || !user) return
    try {
      const res = await fetch(`${BE_URL}/bwl/${post.id}/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.username }),
      })
      if (res.ok) setComments(prev => prev.filter(c => c._id !== commentId))
    } catch { /* ignore */ }
  }

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

  if (!post) return null

  const totalReactions = Object.values(reactions).reduce((acc, users) => acc + users.length, 0)

  return (
    <Dialog open={!!post} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl p-0 gap-0 overflow-hidden h-[90vh] max-h-[90vh]">
        <div className="flex h-full w-full">
          {/* Left: Image */}
          <div className="relative flex-[1.5] bg-black/95 flex items-center justify-center overflow-hidden min-w-0">
            <img
              src={post.images[currentImg]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 pointer-events-none"
            />
           
            <img
              src={post.images[currentImg]}
              alt=""
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
            />
            {post.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImg(i => Math.max(0, i - 1))}
                  disabled={currentImg === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setCurrentImg(i => Math.min(post.images.length - 1, i + 1))}
                  disabled={currentImg === post.images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/70 text-xs bg-black/50 rounded px-2 py-0.5">
                  {currentImg + 1} / {post.images.length}
                </div>
              </>
            )}
          </div>

          {/* Right: Info + Comments */}
          <div className="w-80 flex flex-col border-l bg-background shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">{post.authorId}</span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {loadingComments ? (
                <>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-3/4" />
                </>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có comment nào. Hãy là người đầu tiên!
                </p>
              ) : (
                comments.map(c => (
                  <div key={c._id} className="group flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium">
                      {c.authorId[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold">{c.authorId}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(c.createdTimestamp)}</span>
                      </div>
                      <p className="text-sm break-words">{c.content}</p>
                    </div>
                    {user?.username === c.authorId && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Stats */}
            <div className="px-4 py-2 border-t flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />{totalReactions}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />{comments.length}
              </span>
            </div>

            {/* Comment input */}
            <div className="px-4 py-3 border-t">
              {user ? (
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Thêm comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                    disabled={submitting}
                    className="text-sm h-8"
                  />
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || submitting}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  <a href="/login" className="underline">Đăng nhập</a> để bình luận
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
