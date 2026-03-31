"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { Notification } from "@/components/notifications/hook/useNotifications"
import { NotificationService } from "@/app/api/services/NotificationService"

interface NotificationContextType {
  notifications: Notification[]
  unread: number
  markAllRead: () => Promise<void>
  markOneRead: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children, userId }: { children: React.ReactNode; userId: string | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const esRef = useRef<EventSource | null>(null)

  const fetchInitial = async () => {
    if (!userId) return
    try {
      const [list, count] = await Promise.all([
        NotificationService.getList(userId),
        NotificationService.getUnreadCount(userId),
      ])
      const muted = localStorage.getItem("muteMessages") === "true"
      setNotifications(list)
      setUnread(muted ? 0 : count)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    }
  }

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnread(0)
      return
    }

    fetchInitial()

    const es = NotificationService.createStream(userId)
    esRef.current = es

    es.onerror = (err) => {
      // Gracefully handle connection errors (e.g. backend offline)
      if (es.readyState === EventSource.CLOSED) {
        // es.close() already called or connection lost
      }
    }

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data?.type === "ping") return
        const notif: Notification = data
        const muted = localStorage.getItem("muteMessages") === "true"
        if (!muted) {
          setNotifications(prev => [notif, ...prev])
          setUnread(c => c + 1)
        }
      } catch { /* ignore */ }
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [userId])

  const markAllRead = async () => {
    if (!userId) return
    try {
      await NotificationService.markAllRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const markOneRead = async (id: string) => {
    if (!userId) return
    try {
      const res = await NotificationService.markOneRead(id, userId)
      if (!res.ok) {
        console.error("Server returned error marking notification as read:", await res.text())
        return
      }
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnread(c => Math.max(0, c - 1))
    } catch (err) {
      console.error("Failed to mark one as read:", err)
    }
  }

  return (
    <NotificationContext.Provider value={{ notifications, unread, markAllRead, markOneRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider")
  }
  return context
}
