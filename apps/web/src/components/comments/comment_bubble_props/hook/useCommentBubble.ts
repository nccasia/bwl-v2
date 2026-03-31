import { useState, useRef, useEffect } from "react"
import { Comment } from "@/types/gallery"

interface UseCommentBubbleProps {
    c: Comment
    replies: Comment[]
    currentUserId?: string
    newCommentId?: string | null
    onReactToComment?: (commentId: string, emoji: string) => void
    onReply?: (topLevelParentId: string, replyToAuthorId: string, content: string) => Promise<void> | void
}

export function useCommentBubble({
    c,
    replies,
    currentUserId,
    newCommentId,
    onReactToComment,
    onReply,
}: UseCommentBubbleProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showReplyInput, setShowReplyInput] = useState(false)
    const [showReplies, setShowReplies] = useState(false)
    const [replyToAuthorId, setReplyToAuthorId] = useState(c.authorId)
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const bubbleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (newCommentId === c._id && bubbleRef.current) {
            bubbleRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }, [newCommentId, c._id])

    useEffect(() => {
        if (newCommentId && replies.some(r => r._id === newCommentId)) {
            setShowReplies(true)
        }
    }, [newCommentId, replies])

    const myReaction = currentUserId
        ? Object.entries(c.reactions ?? {}).find(([, users]) => users.includes(currentUserId))?.[0]
        : undefined
    const totalReactions = Object.values(c.reactions ?? {}).reduce((s, v) => s + v.length, 0)

    const handleReact = (emoji: string) => {
        setShowEmojiPicker(false)
        onReactToComment?.(c._id, emoji)
    }

    const openPicker = () => {
        if (hideTimer.current) clearTimeout(hideTimer.current)
        setShowEmojiPicker(true)
    }
    const closePicker = () => {
        hideTimer.current = setTimeout(() => setShowEmojiPicker(false), 200)
    }

    const handleReplyClick = (authorId: string) => {
        setReplyToAuthorId(authorId)
        setShowReplyInput(true)
        setShowReplies(true)
    }

    const handleSubmitReply = async (text: string) => {
        await onReply?.(c._id, replyToAuthorId, text)
        setShowReplyInput(false)
        setShowReplies(true)
    }

    return {
        state: {
            showEmojiPicker,
            showReplyInput,
            showReplies,
            replyToAuthorId,
            bubbleRef,
            myReaction,
            totalReactions,
        },
        refs: {
            bubbleRef,
        },
        handlers: {
            setShowReplies,
            setShowReplyInput,
            handleReact,
            openPicker,
            closePicker,
            handleReplyClick,
            handleSubmitReply,
        }
    }
}