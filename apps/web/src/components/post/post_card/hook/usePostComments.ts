import { useState } from "react"
import { Comment, Reactions } from "@/types/gallery"

const BE_URL = process.env.NEXT_PUBLIC_API_URL

interface UsePostCommentsOptions {
    postId: string
    open: boolean
    comments: Comment[]
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>
    reactions: Reactions
    setReactions: React.Dispatch<React.SetStateAction<Reactions>>
    setTotalLike: React.Dispatch<React.SetStateAction<number>>
}

export function usePostComments({
    postId,
    open,
    comments,
    setComments,
    reactions,
    setReactions,
    setTotalLike,
}: UsePostCommentsOptions) {
    const [loading, setLoading] = useState(false)

    const fetchComments = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${BE_URL}/bwl/${postId}/comments`)
            if (res.ok) setComments(await res.json())
        } finally {
            setLoading(false)
        }
    }

    const fetchReactions = async () => {
        try {
            const res = await fetch(`${BE_URL}/bwl/${postId}/reactions`)
            if (res.ok) {
                const data: Reactions = await res.json()
                setReactions(data)
                setTotalLike(Object.values(data).reduce((s, v) => s + v.length, 0))
            }
        } catch { }
    }

    const addComment = async (
        authorId: string,
        content: string,
        parentId?: string,
        authorAvatar?: string | null
    ) => {
        const res = await fetch(`${BE_URL}/bwl/${postId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authorId, content, parentId }),
        })

        if (res.ok) {
            const saved: Comment = await res.json()
            const enriched = { ...saved, authorAvatar: saved.authorAvatar ?? authorAvatar ?? null, parentId: saved.parentId ?? parentId }
            return enriched
        }
        return null
    }

    const reactToComment = async (commentId: string, userId: string, emoji: string) => {
        setComments(prev => prev.map(c => {
            if (c._id !== commentId) return c
            const rxns = { ...(c.reactions ?? {}) }
            const alreadyReacted = rxns[emoji]?.includes(userId)
            if (alreadyReacted) {
                rxns[emoji] = rxns[emoji].filter(u => u !== userId)
            } else {
                Object.keys(rxns).forEach(e => { rxns[e] = (rxns[e] ?? []).filter(u => u !== userId) })
                rxns[emoji] = [...(rxns[emoji] ?? []), userId]
            }
            return { ...c, reactions: rxns }
        }))

        try {
            const res = await fetch(`${BE_URL}/bwl/${postId}/comments/${commentId}/reactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, emoji }),
            })
            if (res.ok) {
                const updated: Partial<Comment> = await res.json()
                setComments(prev => prev.map(c => c._id === commentId ? { ...c, ...updated } : c))
            }
        } catch { }
    }

    return {
        comments,
        reactions,
        loading,
        fetchReactions,
        fetchComments,
        addComment,
        reactToComment,
    }
}