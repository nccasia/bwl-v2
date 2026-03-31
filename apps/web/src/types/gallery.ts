// ─── Shared types cho gallery ──────────────────────────────────────────────────

import { useTranslations } from "next-intl"

export interface Post {
  id: string
  images: string[]
  authorId: string
  authorAvatar?: string | null
  authorDisplayName?: string | null
  display_name?: string | null
  channelId: string
  createdTimestamp: number
  totalLike: number
  totalComment: number
  caption?: string | null
  mezonReactions?: Record<string, string[]>
}

export interface Comment {
  _id: string
  authorId: string
  authorAvatar?: string | null
  content: string
  createdTimestamp: number
  reactions?: Reactions
  parentId?: string | null
}

export interface Channel {
  channelId: string
  name: string
  count: number
}

export type Reactions = Record<string, string[]>

export const BE_URL = "http://localhost:4000"
export const EMOJIS = ["👍", "❤️", "😂", "🔥", "😍", "💀", "🤡"]

export function timeAgo(ts: number) {
  const t = useTranslations("timeAgo")
  const d = (Date.now() - ts) / 1000
  if (d < 60) return t("just-now")
  if (d < 3600) return t("minutes-ago", { count: Math.floor(d / 60) })
  if (d < 86400) return t("hours-ago", { count: Math.floor(d / 3600) })
  return t("days-ago", { count: Math.floor(d / 86400) })
}
