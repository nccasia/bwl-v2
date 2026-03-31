"use client";

import { CheckCheck, Loader2, BellOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationContext } from "@/components/notifications/NotificationContext";
import { BE_URL } from "@/types/gallery";
import { Button } from "@/components/ui/button";
import { PostCommentDialog } from "@/components/post/post_card/PostCommentDialog/PostCommentDialog";
import { Comment, Reactions } from "@/types/gallery";
import { NotificationItem } from "@/components/notifications/NotificationItems";
import { handleReact, useNotificationHandler } from "@/app/api/services/NotificationService";
import { useTranslations } from "next-intl";


export default function Notifications() {
  const { user } = useAuth();
  const { notifications, unread, markAllRead, markOneRead } = useNotificationContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reactions>({});
  const [totalLike, setTotalLike] = useState(0);
  const t = useTranslations("notifications");

  const { handleNotificationClick, isDialogOpen, selectedPost, setSelectedPost, closeDialog: _closeDialog } =
    useNotificationHandler(BE_URL);

  const closeDialog = () => {
    _closeDialog();
    setComments([]);
    setReactions({});
    setTotalLike(0);
  };


  const newNotifications = notifications.filter((n) => !n.read);
  const earlierNotifications = notifications.filter((n) => n.read);

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-8">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-4xl font-black tracking-tight mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("you-have")} <span className="text-brand font-bold">{unread}</span> {t("new-notification")}
          </p>
        </div>

        {unread > 0 && (
          <Button
            variant="ghost"
            onClick={markAllRead}
            className="text-brand hover:text-brand/70 hover:bg-brand/10 rounded-2xl px-6 py-6 h-auto flex items-center gap-2 font-bold transition-all border border-brand/20"
          >
            <CheckCheck className="w-5 h-5" />
            {t("mark-all-read")}
          </Button>
        )}
      </div>

      {newNotifications.length > 0 && (
        <div className="mb-10">
          <h2 className="text-foreground text-lg font-black uppercase tracking-widest mb-6 px-1 opacity-50 flex items-center gap-3">
            {t("latest")}
            <div className="h-px flex-1 bg-linear-to-r from-brand/10 to-transparent" />
          </h2>
          <div className="space-y-4">
            {newNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                isNew
                onClick={() => handleNotificationClick(notification, markOneRead)}
              />
            ))}
          </div>
        </div>
      )}

      {earlierNotifications.length > 0 && (
        <div className="mb-10">
          <h2 className="text-foreground text-lg font-black uppercase tracking-widest mb-6 px-1 opacity-50 flex items-center gap-3">
            {t("previous")}
            <div className="h-px flex-1 bg-linear-to-r from-border/50 to-transparent" />
          </h2>
          <div className="space-y-4">
            {earlierNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => handleNotificationClick(notification, markOneRead)}
              />
            ))}
          </div>
        </div>
      )}

      {isDialogOpen && (
        <PostCommentDialog
          post={selectedPost}
          currentUser={user}
          open={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          comments={comments}
          setComments={setComments}
          reactions={reactions}
          setReactions={setReactions}
          setTotalLike={setTotalLike}
          onReact={handleReact}
        />
      )}

      {notifications.length === 0 && (
        <div className="text-center py-32 bg-card rounded-[40px] border border-dashed border-border shadow-sm">
          <BellOff className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground text-xl font-bold tracking-tight">{t("no-new-notification")}</p>
          <p className="text-muted-foreground/60 mt-2">{t("notification-feature")}</p>
        </div>
      )}
    </div>
  );
}



