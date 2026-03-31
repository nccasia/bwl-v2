import { Dispatch, SetStateAction } from "react"
import { AuthUser } from "@/hooks/useAuth"
import { Post, Comment as GalleryComment, Reactions } from "@/types/gallery"

export interface PostCommentDialogProps {
    post: Post | null
    currentUser?: AuthUser | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onReact?: (emoji: string) => void | Promise<void>
    myEmoji?: string | null
    comments: GalleryComment[]
    setComments: Dispatch<SetStateAction<GalleryComment[]>>
    reactions: Reactions
    setReactions: Dispatch<SetStateAction<Reactions>>
    setTotalLike: Dispatch<SetStateAction<number>>
    disableSse?: boolean
}

export const handleAddComment = async ({
    currentUser,
    commentText,
    addComment,
    setSubmitting,
    setCommentText,
}: {
    currentUser?: { username: string; avatar?: string | null }
    commentText: string
    addComment: (authorId: string, content: string, parentId?: string, authorAvatar?: string | null) => Promise<GalleryComment | null>
    setSubmitting: (v: boolean) => void
    setCommentText: (v: string) => void
}): Promise<GalleryComment | null> => {
    if (!currentUser || !commentText.trim()) return null

    setSubmitting(true)

    try {
        const saved = await addComment(currentUser.username, commentText.trim(), undefined, currentUser.avatar ?? null)
        if (saved) setCommentText("")
        return saved
    } finally {
        setSubmitting(false)
    }
}

export const downloadAllImages = async (post: {
    id: string
    images: string[]
}) => {
    for (let i = 0; i < post.images.length; i++) {
        const url = post.images[i]
        const ext = url.split(".").pop()?.split(/[?#]/)[0] || "jpg"
        const filename = `post_${post.id}_${i + 1}.${ext}`

        try {
            const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`)
            const blob = await res.blob()

            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement("a")

            a.href = blobUrl
            a.download = filename

            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            URL.revokeObjectURL(blobUrl)

            await new Promise(r => setTimeout(r, 600))
        } catch (e) {
            console.error("Download failed:", e)
            window.open(url, "_blank")
        }
    }
}