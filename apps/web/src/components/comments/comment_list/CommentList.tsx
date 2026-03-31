"use client"

import { CommentBubble } from "../comment_bubble_props/CommentBubble"
import {useTranslations} from 'next-intl';
import { useCommentList } from "./hook/useCommentList";
import { Comment } from "@/types/gallery";

interface CommentListProps {
    comments: Comment[]
    loading: boolean
    currentUserId?: string
    currentUserAvatar?: string
    newCommentId?: string | null
    onReactToComment?: (commentId: string, emoji: string) => void
    onReply?: (topLevelParentId: string, replyToAuthorId: string, content: string) => Promise<void> | void
}

export function CommentList({
    comments,
    loading,
    currentUserId,
    currentUserAvatar,
    newCommentId,
    onReactToComment,
    onReply,
}: CommentListProps) {
    const t = useTranslations('comment-list')
    const { topLevel, repliesMap } = useCommentList(comments)
    
    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
        )
    }

    if (!comments.length) {
        return (    
            <div className="text-center text-lg text-muted-foreground py-4 italic">
                {t('no-comment')}
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {topLevel.map(c => (
                <CommentBubble
                    key={c._id}
                    c={c}
                    replies={repliesMap[c._id] ?? []}
                    currentUserId={currentUserId}
                    currentUserAvatar={currentUserAvatar}
                    newCommentId={newCommentId}
                    onReactToComment={onReactToComment}
                    onReply={onReply}
                />
            ))}
        </div>
    )
}