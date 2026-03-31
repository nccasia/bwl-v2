import { Comment, timeAgo } from "@/types/gallery"
import { useEffect, useRef, useState } from "react"

interface UseReplyBuddleProps {
    reply: Comment
    currentUserId?: string
    newCommentId?: string | null
    onReactToComment?: (commentId: string, emoji: string) => void
    onReplyClick: () => void
}

export function useReplyBuddle({
    reply,
    currentUserId,
    newCommentId,
    onReactToComment,
    onReplyClick,
}: UseReplyBuddleProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const bubbleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
            if (newCommentId === reply._id && bubbleRef.current) {
                bubbleRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
            }
        }, [newCommentId, reply._id])
    
    const myReaction = currentUserId
            ? Object.entries(reply.reactions ?? {}).find(([, users]) => users.includes(currentUserId))?.[0]
            : undefined
    const totalReactions = Object.values(reply.reactions ?? {}).reduce((s, v) => s + v.length, 0)
    
    const openPicker = () => { if (hideTimer.current) clearTimeout(hideTimer.current); setShowEmojiPicker(true) }
    const closePicker = () => { hideTimer.current = setTimeout(() => setShowEmojiPicker(false), 200) }

    return {
        state: {
            showEmojiPicker,
            myReaction,
            totalReactions,
        },

        refs: {
            hideTimer,
            bubbleRef,
        },
        handlers: {
            openPicker,
            closePicker,
            onReactToComment,
            onReplyClick,
            setShowEmojiPicker,
        }
    }
}