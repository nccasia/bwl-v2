import { handler } from "next/dist/build/templates/app-page"
import { useState } from "react"

interface ReplyInputBoxProps {
    targetAuthorId: string
    currentUserAvatar?: string
    currentUserId?: string
    onSubmit: (text: string) => Promise<void>
    onCancel: () => void
}

export function useReplyInputBox(props: ReplyInputBoxProps) {
    const { targetAuthorId, currentUserAvatar, currentUserId, onSubmit, onCancel } = props
    const [text, setText] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmitReply = async () => {
        if (!text.trim() || submitting) return
        setSubmitting(true)
        try {
            await onSubmit(text.trim())
            setText("")
            onCancel()
        } finally {
            setSubmitting(false)
        }
    }

    return {
        state: {
            targetAuthorId,
            currentUserAvatar,
            currentUserId,
            text,
            submitting,
        },
        handlers: {
            onSubmit,
            onCancel,
            setText,
            handleSubmitReply
        }
    }
}