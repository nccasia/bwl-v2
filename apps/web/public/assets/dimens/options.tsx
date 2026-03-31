import { Calendar, Clock, MessageSquare } from "lucide-react"

export const hotOptions = [
    { id: "24h", label: "24h", icon: <Clock className="w-4 h-4" /> },
    { id: "7d", label: "7 ngày qua", icon: <Calendar className="w-4 h-4" /> },
    { id: "top_comments", label: "Top bình luận", icon: <MessageSquare className="w-4 h-4" /> },
] as const

export const REACTION_MAP: Record<string, { label: string; color: string }> = {
    "👍": { label: "Thích", color: "text-blue-500 font-bold" },
    "❤️": { label: "Yêu thích", color: "text-red-500 font-bold" },
    "😂": { label: "Haha", color: "text-amber-500 font-bold" },
    "🔥": { label: "Cực cháy", color: "text-orange-500 font-bold" },
    "😍": { label: "Yêu quá", color: "text-red-400 font-bold" },
    "💀": { label: "Cạn lời", color: "text-gray-500 font-bold" },
    "🤡": { label: "Hài hước", color: "text-orange-400 font-bold" },
}