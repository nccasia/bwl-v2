import { Calendar, Clock, MessageSquare } from "lucide-react"
import { useTranslations } from "next-intl";

export const hotOptions = [
    { id: "24h", label: "24h", icon: <Clock className="w-4 h-4" /> },
    { id: "7d", label: "7 ngày qua", icon: <Calendar className="w-4 h-4" /> },
    { id: "top_comments", label: "Top bình luận", icon: <MessageSquare className="w-4 h-4" /> },
] as const

export function Icon() {
    const t = useTranslations("option")
    const REACTION_MAP: Record<string, { label: string; color: string }> = {
    "👍": { label: t("like"), color: "text-blue-500 font-bold" },
    "❤️": { label: t("love"), color: "text-red-500 font-bold" },
    "😂": { label: t("haha"), color: "text-amber-500 font-bold" },
    "🔥": { label: t("hot"), color: "text-orange-500 font-bold" },
    "😍": { label: t("love2"), color: "text-red-400 font-bold" },
    "💀": { label: t("dead"), color: "text-gray-500 font-bold" },
    "🤡": { label: t("funny"), color: "text-orange-400 font-bold" },
}
} 