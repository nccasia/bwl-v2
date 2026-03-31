"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  MessageCircle, Heart,
  AlertCircle, ChevronLeft, ChevronRight,
  LogIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { UserAvatar } from "@/components/UserAvatar"
import { timeAgo, Post, Comment, Reactions } from "@/types/gallery"
import { AuthUser } from "@/hooks/useAuth"
import { REACTION_MAP } from "@/utils/constants/reactions"
import { PostCommentDialog } from "./PostCommentDialog/PostCommentDialog"

import { EmojiPicker } from "./EmojiPicker"

const BE_URL = process.env.NEXT_PUBLIC_API_URL

interface PostCardProps {
  post: Post
  currentUser: AuthUser | null
}


export function PostCard({ post, currentUser }: PostCardProps) {
  const [imgIdx, setImgIdx] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<Reactions>({})
  const [totalLike, setTotalLike] = useState(post.totalLike)
  const [showPicker, setShowPicker] = useState(false)
  const [commentCount, setCommentCount] = useState(post.totalComment)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const pickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const articleRef = useRef<HTMLElement>(null)
  // Dedup SSE comment events (phòng trường hợp nhiều SSE connections cùng fire)
  const processedCommentIds = useRef<Set<string>>(new Set())

  const myEmoji = currentUser
    ? Object.entries(reactions).find(([, users]) => users.includes(currentUser.username!))?.[0]
    : null

  const activeReaction = myEmoji ? REACTION_MAP[myEmoji] : { label: "Thích", color: "text-muted-foreground" }

  useEffect(() => {
    fetch(`${BE_URL}/bwl/${post.id}/reactions`)
      .then(r => r.ok ? r.json() : {})
      .then((data: Reactions) => {
        setReactions(data)
        setTotalLike(Object.values(data).reduce((s, v) => s + v.length, 0))
      })
      .catch(() => { })
  }, [post.id])

  useEffect(() => {
    let es: EventSource | null = null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !es) {
          fetch(`${BE_URL}/bwl/${post.id}/reactions`)
            .then(r => r.ok ? r.json() : null)
            .then((data: Reactions | null) => {
              if (data) {
                setReactions(data)
                setTotalLike(Object.values(data).reduce((s, v) => s + v.length, 0))
              }
            })
            .catch(() => { })

          es = new EventSource(`${BE_URL}/bwl/${post.id}/comments/stream`)
          es.onmessage = (ev) => {
            try {
              const msg = JSON.parse(ev.data)
              if (msg?.type === 'ping') return

              if (msg.type === 'reaction') {
                const data: Reactions = msg.data
                setReactions(data)
                setTotalLike(Object.values(data).reduce((s, v) => s + v.length, 0))
              }

              if (msg.type === 'comment') {
                const raw = msg.data
                const incoming: Comment = {
                  ...raw,
                  _id: typeof raw._id === 'object' ? (raw._id?.$oid ?? String(raw._id)) : String(raw._id),
                }
                if (processedCommentIds.current.has(incoming._id)) return
                processedCommentIds.current.add(incoming._id)
                setTimeout(() => processedCommentIds.current.delete(incoming._id), 10_000)

                setComments(prev => {
                  if (prev.some(c => c._id === incoming._id)) return prev
                  return [...prev, incoming]
                })
                setCommentCount(c => c + 1)
              }

              if (msg.type === 'delete_comment') {
                setComments(prev => prev.filter(c => c._id !== msg.data.commentId))
                setCommentCount(c => Math.max(0, c - 1))
              }

              if (msg.type === 'update_comment') {
                const updated: Comment = msg.data
                setComments(prev => prev.map(c => c._id === updated._id ? { ...c, reactions: updated.reactions } : c))
              }
            } catch { /* ignore */ }
          }
        } else if (!entry.isIntersecting && es) {
          es.close()
          es = null
        }
      },
      { threshold: 0.1 }
    )

    if (articleRef.current) observer.observe(articleRef.current)

    return () => {
      observer.disconnect()
      es?.close()
    }
  }, [post.id])
  useEffect(() => {
    const handler = (e: Event) => {
      const { postId } = (e as CustomEvent<{ postId: string }>).detail
      if (postId !== post.id) return
      articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => setShowCommentDialog(true), 300)
    }
    window.addEventListener('open-post', handler)
    return () => window.removeEventListener('open-post', handler)
  }, [post.id])

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showPicker])

  const handleReact = async (emoji: string) => {
    setShowPicker(false)
    if (!currentUser) {
      setShowAuthDialog(true)
      return
    }
    const isToggleOff = myEmoji === emoji
    const res = await fetch(`${BE_URL}/bwl/${post.id}/reactions`, {
      method: isToggleOff ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isToggleOff
          ? { userId: currentUser.username! }
          : { userId: currentUser.username!, emoji }
      ),
    })
    if (res.ok) {
      const data: Reactions = await res.json()
      setReactions(data)
      setTotalLike(Object.values(data).reduce((s, v) => s + v.length, 0))
    }
  }

  const handleOpenCommentDialog = () => {
    if (!currentUser) {
      setShowAuthDialog(true)
      return
    }
    setShowCommentDialog(true)
  }

  return (
    <article ref={articleRef} className=" bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/profile/${encodeURIComponent(post.authorId)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <UserAvatar name={post.authorId} avatarUrl={post.authorAvatar ?? undefined} />
          <div>
            <p className="text-sm font-semibold leading-none">{post.authorDisplayName ?? post.authorId}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(post.createdTimestamp)} trước</p>
          </div>
        </Link>
      </div>

      <div className="relative bg-black select-none" style={{ aspectRatio: "1/1" }}>
        {post.images[0] ? (
          <img src={post.images[imgIdx]} alt="" loading="lazy"
            className="w-full h-full object-contain cursor-pointer"
            onClick={handleOpenCommentDialog}
            onDoubleClick={() => handleReact("❤️")} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <AlertCircle className="w-8 h-8" />
          </div>
        )}
        {post.images.length > 1 && imgIdx > 0 && (
          <button onClick={() => setImgIdx(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1.5 cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}
        {post.images.length > 1 && imgIdx < post.images.length - 1 && (
          <button onClick={() => setImgIdx(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1.5 cursor-pointer">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}
        {post.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {post.images.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`rounded-full transition-all ${i === imgIdx ? "bg-primary w-4 h-1.5" : "bg-white/50 w-1.5 h-1.5"}`} />
            ))}
          </div>
        )}
      </div>

      {post.caption && (
        <div className="px-4 pt-2">
          <p className="text-sm">
            <span className="font-semibold mr-1">{post.authorDisplayName ?? post.authorId}</span>
            {post.caption}
          </p>
        </div>
      )}

      {(() => {
        const mezonTotal = Object.values(post.mezonReactions ?? {}).reduce((s, users) => s + users.length, 0);
        const mezonUsers = [...new Set(Object.values(post.mezonReactions ?? {}).flat())];
        if (mezonTotal === 0) return null;
        return (
          <div className="px-6 pt-1">
            <div className="text-xs text-muted-foreground" title={mezonUsers.join(', ')}>
              💬 {mezonTotal} react trên Mezon {mezonUsers.length > 0 && `(${mezonUsers.slice(0, 3).join(', ')}${mezonUsers.length > 3 ? ` +${mezonUsers.length - 3}` : ''})`}
            </div>
          </div>
        );
      })()}

      {(totalLike > 0 || commentCount > 0) && (
        <div className="px-6 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            {totalLike > 0 && (
              <div className="flex items-center gap-0.5">
                {Object.entries(reactions)
                  .filter(([, u]) => u.length > 0)
                  .map(([emoji]) => (
                    <button key={emoji} onClick={() => handleReact(emoji)}
                      className={`text-lg leading-none cursor-pointer ${myEmoji === emoji ? "opacity-100" : "opacity-80 hover:opacity-100"}`}>
                      {emoji}
                    </button>
                  ))}
                <span className="ml-1 text-sm text-muted-foreground font-medium">{totalLike}</span>
              </div>
            )}
          </div>
          {commentCount > 0 && (
            <div
              onClick={handleOpenCommentDialog}
              className="text-sm text-muted-foreground hover:underline cursor-pointer"
            >
              {commentCount} bình luận
            </div>
          )}
        </div>
      )}

      <div className="px-6 pt-1 pb-1 grid grid-cols-2 items-center border-t mt-1">
        <div
          className="relative"
          ref={pickerRef}
          onMouseLeave={() => {
            if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current)
            setShowPicker(false)
          }}
        >
          {showPicker && <EmojiPicker onPick={handleReact} />}
          <button
            onClick={() => currentUser ? (myEmoji ? handleReact(myEmoji) : handleReact("👍")) : setShowAuthDialog(true)}
            onMouseEnter={() => {
              pickerTimerRef.current = setTimeout(() => setShowPicker(true), 500)
            }}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all hover:bg-muted cursor-pointer ${activeReaction.color}`}
          >
            <span className="text-xl leading-none">{myEmoji ?? <Heart className="w-6 h-6" />}</span>
            <span className="text-sm font-semibold">{activeReaction.label}</span>
          </button>
        </div>

        <button
          onClick={handleOpenCommentDialog}
          className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="text-sm font-semibold">Bình luận</div>
        </button>

      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-xl">Yêu cầu đăng nhập</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-muted-foreground">
              Vui lòng đăng nhập để thực hiện bình luận và tương tác cảm xúc cho bài viết này.
            </p>
            <Link href="/login" className="block w-full">
              <Button className="w-full gap-2 py-6 text-base font-semibold">
                <LogIn className="w-5 h-5" />
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setShowAuthDialog(false)}>
              Để sau
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        disableSse  // PostCard đã có SSE connection riêng
      />
    </article>
  )
}
