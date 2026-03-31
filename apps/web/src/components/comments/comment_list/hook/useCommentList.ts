import { Comment } from "@/types/gallery"
import { useMemo } from "react"

export function useCommentList(comment: Comment[]) {
        const group = useMemo(() => {
            const sorted = [...comment].sort((a, b) => a.createdTimestamp - b.createdTimestamp)
            const topLevel = sorted.filter(c => !c.parentId)
            const repliesMap: Record<string, Comment[]> = {}
            for (const c of sorted) {
                if (c.parentId) {
                    if (!repliesMap[c.parentId]) repliesMap[c.parentId] = []
                    repliesMap[c.parentId].push(c)
                }
            }
            return { topLevel, repliesMap }
        }, [comment])
        return group
    }