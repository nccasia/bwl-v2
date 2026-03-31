"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

const BE_URL = process.env.NEXT_PUBLIC_API_URL

export interface Notification {
  _id: string
  userId: string
  fromUserId: string
  fromUserDisplayName: string | null
  fromUserAvatar: string | null
  postThumbnail: string | null
  type: "comment" | "reaction" | "reply"
  postId: string
  content: string
  read: boolean
  createdAt: number
}

export const getNotificationText = (n: Notification) => {
  const t = useTranslations("notifications");
  switch (n.type) {
    case "reaction": return t("like");
    case "comment": return t("comment");
    case "reply": return t("reply");
    default: return n.content || t("default");
  }
};

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const esRef = useRef<EventSource | null>(null)
  const knownIdsRef = useRef<Set<string>>(new Set())

  const fetchInitial = async () => {
    if (!userId) return
    const [listRes, countRes] = await Promise.all([
      fetch(`${BE_URL}/notifications?userId=${userId}`).then(r => r.json()),
      fetch(`${BE_URL}/notifications/unread-count?userId=${userId}`).then(r => r.json()),
    ])
    setNotifications(listRes.data ?? [])
    setUnread(typeof countRes === "number" ? countRes : 0)
  }

  useEffect(() => {
    if (!userId) return

    fetchInitial()

    const es = new EventSource(`${BE_URL}/notifications/stream?userId=${userId}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data?.type === "ping") return
        const notif: Notification = data

        const isNew = !knownIdsRef.current.has(notif._id)

        setNotifications(prev => {
          const exists = prev.some(n => n._id === notif._id)
          if (exists) return prev.map(n => n._id === notif._id ? notif : n)
          return [notif, ...prev]
        })

        if (!knownIdsRef.current.has(notif._id)) {
          knownIdsRef.current.add(notif._id)
          setUnread(c => c + 1)
          if (notif.type === 'comment' && notif.postId) {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('post-comment-added', { detail: { postId: notif.postId } }))
            }, 0)
          }
        }
      } catch {  }
    }

    return () => {
      es.close()
      esRef.current = null
      knownIdsRef.current.clear()
    }
  }, [userId])

  const markAllRead = async () => {
    if (!userId) return
    await fetch(`${BE_URL}/notifications/read-all?userId=${userId}`, { method: "PATCH" })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  return { notifications, unread, markAllRead }
}
