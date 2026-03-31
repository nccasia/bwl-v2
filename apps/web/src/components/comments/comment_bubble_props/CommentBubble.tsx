"use client"

import { UserAvatar } from "@/components/UserAvatar"
import { Comment, timeAgo } from "@/types/gallery"
import { ChevronDown } from "lucide-react"
import { ReplyInputBox } from "../reply_input_box/ReplyInputBox"
import { InlineEmojiPicker } from "../inline_emoji_picker/InlineEmojiPicker"

import { useCommentBubble } from "./hook/useCommentBubble"
import { ReplyBubble } from "../reply_bubble/ReplyBubble"
import { useTranslations } from "next-intl"

interface CommentBubbleProps {
    c: Comment
    replies: Comment[]
    currentUserId?: string
    currentUserAvatar?: string
    newCommentId?: string | null
    onReactToComment?: (commentId: string, emoji: string) => void
    onReply?: (topLevelParentId: string, replyToAuthorId: string, content: string) => Promise<void> | void
}

export function CommentBubble(props: CommentBubbleProps) {
    const t = useTranslations("comment-bubble")
    const { c, replies, currentUserId, currentUserAvatar, newCommentId, onReactToComment } = props
    const { state, refs, handlers } = useCommentBubble(props)

    return (
        <div ref={refs.bubbleRef} className="flex gap-2">
            <UserAvatar name={c.authorId} avatarUrl={c.authorAvatar ?? undefined} size="sm" />
            
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="bg-secondary/60 px-3.5 py-2.5 rounded-[20px] relative inline-block max-w-[90%]">
                    <p className="text-[15px] font-bold hover:underline cursor-pointer leading-tight mb-0.5">{c.authorId}</p>
                    <p className="text-[15px] leading-snug text-foreground/90">{c.content}</p>
                    
                    {state.totalReactions > 0 && (
                        <div className="absolute -bottom-3 -right-1 flex items-center bg-background border border-border/50 rounded-full px-1.5 py-0.5 shadow-sm gap-0.5 text-[11px] cursor-pointer hover:shadow-md transition-shadow z-10">
                            {Object.entries(c.reactions ?? {})
                                .filter(([, u]) => u.length > 0)
                                .slice(0, 3)
                                .map(([emoji]) => (
                                    <span key={emoji} className="text-[15px]">{emoji}</span>
                                ))}
                            <span className="text-muted-foreground font-semibold pl-0.5">{state.totalReactions}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 px-1 text-[14px] text-[#65686c] font-bold items-center">
                    <span className="font-normal">{timeAgo(c.createdTimestamp)}</span>

                    <div className="relative" onMouseEnter={handlers.openPicker} onMouseLeave={handlers.closePicker}>
                        {state.showEmojiPicker && (
                            <div onMouseEnter={handlers.openPicker} onMouseLeave={handlers.closePicker}>
                                <InlineEmojiPicker onPick={handlers.handleReact} />
                            </div>
                        )}
                        <button
                            className={`hover:underline transition-colors cursor-pointer ${state.myReaction ? "text-primary text-[15px]" : "hover:text-foreground text-[15px]"}`}
                            onClick={() => state.myReaction ? onReactToComment?.(c._id, state.myReaction) : handlers.setShowReplyInput(v => !v)}
                        >
                            {state.myReaction ?? t("like")}
                        </button>
                    </div>

                    <button
                        className="hover:underline hover:text-foreground transition-colors cursor-pointer"
                        onClick={() => handlers.handleReplyClick(c.authorId)}
                    >
                        {t("reply")}
                    </button>

                    {replies.length > 0 && (
                        <button
                            className="flex items-center gap-0.5 text-primary/70 hover:text-primary transition-colors cursor-pointer"
                            onClick={() => handlers.setShowReplies(v => !v)}
                        >
                            <div className="w-4 h-px bg-border/60" />
                            <span className="ml-1">{state.showReplies ? "" : `${replies.length} ${t("feedback")}`}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${state.showReplies ? "rotate-180" : "rotate-0"}`} />
                        </button>
                    )}
                </div>

                {(replies.length > 0 || state.showReplyInput) && (
                    <div className="mt-1">
                        <div className={`grid transition-all duration-300 ease-in-out ${state.showReplies ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                            <div className="overflow-hidden">
                                <div className="flex flex-col gap-3 pl-3 border-l-2 border-border/40 mt-1">
                                    {replies.map(reply => (
                                        <ReplyBubble
                                            key={reply._id}
                                            reply={reply}
                                            currentUserId={currentUserId}
                                            newCommentId={newCommentId}
                                            onReactToComment={onReactToComment}
                                            onReplyClick={() => handlers.handleReplyClick(reply.authorId)}
                                        />
                                    ))}

                                    {state.showReplyInput && (
                                        <ReplyInputBox
                                            targetAuthorId={state.replyToAuthorId}
                                            currentUserId={currentUserId}
                                            currentUserAvatar={currentUserAvatar}
                                            onSubmit={handlers.handleSubmitReply}
                                            onCancel={() => handlers.setShowReplyInput(false)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}