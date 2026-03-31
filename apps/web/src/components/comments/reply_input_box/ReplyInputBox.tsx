import { UserAvatar } from "@/components/UserAvatar"
import { SendHorizontal } from "lucide-react"

import { useReplyInputBox } from "./hook/useReplyInputBox"
import { useTranslations } from "next-intl"

interface ReplyInputBoxProps {
    targetAuthorId: string
    currentUserAvatar?: string
    currentUserId?: string
    onSubmit: (text: string) => Promise<void>
    onCancel: () => void
}

export function ReplyInputBox(props: ReplyInputBoxProps) {
    const t = useTranslations("reply-input-box")
    const { state, handlers } = useReplyInputBox(props)

    return (
        <div className="flex gap-2 items-start py-2">
            <UserAvatar
                name={state.currentUserId ?? "?"}
                avatarUrl={state.currentUserAvatar}
                size="sm"
            />
            <div className="flex-1 min-w-0">

                <div className="bg-secondary/80 rounded-[20px] px-3.5 py-2 flex items-end gap-2">
                    <textarea
                        rows={1}
                        autoFocus
                        value={state.text}
                        onChange={e => handlers.setText(e.target.value)}
                        onInput={e => {
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = "auto"
                            target.style.height = `${target.scrollHeight}px`
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handlers.handleSubmitReply()
                            }
                            if (e.key === "Escape") handlers.onCancel()
                        }}
                        placeholder={`${t("reply-to")} ${state.targetAuthorId}...`}
                        className="w-full bg-transparent outline-none text-[15px] text-helvetica-neue placeholder:text-muted-foreground/80 resize-none overflow-hidden min-h-[20px] max-h-[150px] leading-tight flex items-center py-0.5"
                        disabled={state.submitting}
                    />

                    <button
                        onClick={handlers.handleSubmitReply}
                        disabled={!state.text.trim() || state.submitting}
                        className="text-primary disabled:opacity-30 transition-opacity hover:opacity-70"
                    >
                        <SendHorizontal className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-1 px-1">
                    <div className="flex gap-3 text-muted-foreground/70">
                        {/* <button className="hover:text-muted-foreground transition-colors" title="Emoji"><Smile className="w-5 h-5" /></button>
                        <button className="hover:text-muted-foreground transition-colors" title="Ảnh"><ImageIcon className="w-5 h-5" /></button>
                        <button className="hover:text-muted-foreground transition-colors" title="Video"><Film className="w-5 h-5" /></button>
                        <button className="hover:text-muted-foreground transition-colors" title="GIF"><Sticker className="w-5 h-5" /></button> */}
                    </div>
                </div>
            </div>
        </div>
    )
}