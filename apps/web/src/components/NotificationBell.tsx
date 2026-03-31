"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { useNotifications, Notification } from "@/components/notifications/hook/useNotifications"
import { timeAgo } from "@/types/gallery"

function NotifIcon(type: Notification["type"]) {
  return type === "comment" ? "💬" : type === "reaction" ? "😊" : "↩️"
}

interface NotificationBellProps {
  userId: string | null
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { notifications, unread, markAllRead } = useNotifications(userId)
  const panelRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !bellRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleOpen = () => {
    setOpen(v => !v)
    if (!open && unread > 0) {
      setTimeout(() => markAllRead(), 1500)
    }
  }

  const handleNotifClick = (postId: string) => {
    setOpen(false)
    markAllRead()
    router.push(`/gallery?post=${postId}`)
  }

  if (!userId) return null

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={handleOpen}
        className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        <Bell className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[17px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none shadow-sm">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto rounded-xl border bg-card shadow-xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-card">
            <span className="text-sm font-semibold">Thông báo</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline cursor-pointer">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không có thông báo nào
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleNotifClick(n.postId)}
                  className={`flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{NotifIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{n.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)} trước</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
