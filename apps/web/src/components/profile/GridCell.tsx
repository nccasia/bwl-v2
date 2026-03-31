import { Post } from "@/types/gallery";
import { Heart, Images, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const BE_URL = process.env.NEXT_PUBLIC_API_URL

export function GridCell({ post, onSelect }: { post: Post; onSelect: (p: Post) => void }) {
  const [reactions, setReactions] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetch(`${BE_URL}/bwl/${post.id}/reactions`)
      .then(r => r.ok ? r.json() : {})
      .then(setReactions)
      .catch(() => { })
  }, [post.id])

  const totalReactions = useMemo(() => {
    return Object.values(reactions).reduce((acc, users) => acc + users.length, 0)
  }, [reactions])

  return (
    <div
      onClick={() => onSelect(post)}
      className="relative aspect-square bg-muted cursor-pointer overflow-hidden group"
    >
      {post.images[0] ? (
        <img src={post.images[0]} alt="" loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <Images className="w-5 h-5" />
        </div>
      )}
      {post.images.length > 1 && (
        <Images className="absolute top-2 right-2 w-4 h-4 text-white drop-shadow-md" />
      )}
      {/* hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <span className="flex items-center gap-1 text-white text-sm font-semibold">
          <Heart className="w-4 h-4 fill-white" /> {totalReactions}
        </span>
        <span className="flex items-center gap-1 text-white text-sm font-semibold">
          <MessageCircle className="w-4 h-4 fill-white" /> {post.totalComment}
        </span>
      </div>
    </div>
  )
}