import { UserAvatar } from "@/components/UserAvatar"
import { Comment, timeAgo } from "@/types/gallery"
import { InlineEmojiPicker } from "../inline_emoji_picker/InlineEmojiPicker"
import { useReplyBuddle } from "./hook/useReplyBuddle"
import { useTranslations } from "next-intl"

interface UseReplyBuddleProps {
    reply: Comment
    currentUserId?: string
    newCommentId?: string | null
    onReactToComment?: (commentId: string, emoji: string) => void
    onReplyClick: () => void
}

export function ReplyBubble(props: UseReplyBuddleProps) {
    const t = useTranslations("reply-bubble")
    const { reply, onReactToComment, onReplyClick } = props
    const { state, refs, handlers} = useReplyBuddle(props)

    return (
        <div ref={refs.bubbleRef} className="flex gap-2">
            <UserAvatar name={reply.authorId} avatarUrl={reply.authorAvatar ?? undefined} size="sm" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="bg-secondary/60 px-3.5 py-2.5 rounded-[20px] relative inline-block max-w-[90%]">
                    <p className="text-[15px] font-bold hover:underline cursor-pointer leading-tight mb-0.5">{reply.authorId}</p>
                    <p className="text-[15px] leading-snug text-foreground/90">{reply.content}</p>
                    { state.totalReactions > 0 && (
                        <div className="absolute -bottom-3 -right-1 flex items-center bg-background border border-border/50 rounded-full px-1.5 py-0.5 shadow-sm gap-0.5 cursor-pointer hover:shadow-md transition-shadow z-10">
                            {Object.entries(reply.reactions ?? {})
                                .filter(([, u]) => u.length > 0)
                                .slice(0, 3)
                                .map(([emoji]) => <span key={emoji} className="text-[15px]">{emoji}</span>)}
                            <span className="text-muted-foreground font-semibold pl-0.5 text-[11px]">{state.totalReactions}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 px-1 text-[14px] text-[#65686c] font-bold items-center">
                    <span className="font-normal">{timeAgo(reply.createdTimestamp)}</span>

                    <div className="relative" onMouseEnter={handlers.openPicker} onMouseLeave={handlers.closePicker}>
                        {state.showEmojiPicker && (
                            <div onMouseEnter={handlers.openPicker} onMouseLeave={handlers.closePicker}>
                                <InlineEmojiPicker onPick={(emoji) => { handlers.setShowEmojiPicker(false); onReactToComment?.(reply._id, emoji) }} />
                            </div>
                        )}
                        <button
                            className={`hover:underline transition-colors ${state.myReaction ? "text-primary text-[15px]" : "hover:text-foreground text-[15px]"}`}
                            onClick={() => state.myReaction ? onReactToComment?.(reply._id, state.myReaction) : handlers.setShowEmojiPicker(v => !v)}
                        >
                            {state.myReaction ?? t("like")}
                        </button>
                    </div>

                    <button className="hover:underline hover:text-foreground transition-colors" onClick={onReplyClick}>
                        {t("reply")}
                    </button>
                </div>
            </div>
        </div>
    )
}