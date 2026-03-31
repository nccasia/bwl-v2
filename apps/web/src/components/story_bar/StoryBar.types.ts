import { Channel } from "@/types/gallery"

export interface StoryBarProps {
    channels: Channel[]
    active: string
    onSelect: (id: string) => void
    hotPeriod?: string
    onHotPeriodChange?: (period: "24h" | "7d" | "top_comments") => void
}

export const getStatus = (id: string, name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    if (name === "Hot") return { isHot: true }
    if (name === "All") return null
    if (hash % 4 === 0) return { online: true }
    if (hash % 4 === 1) return { time: `${(hash % 50) + 5} phút` }
    return null
}