import { Notification, getNotificationText } from "@/components/notifications/hook/useNotifications";
import { timeAgo } from "@/types/gallery";
import { IconForType } from "@/components/notifications/types/Notifications";
import { useTranslations } from "next-intl";

export function NotificationItem({
  notification,
  isNew,
  onClick
}: {
  notification: Notification;
  isNew?: boolean;
  onClick: () => void;
}) {

  const resolvedAvatar = notification.fromUserAvatar || "/assets/img/mezon-logo.webp";
  const resolvedName = notification.fromUserDisplayName || notification.fromUserId;
  const postImage = notification.postThumbnail;
  const t = useTranslations("notifications");

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-[32px] overflow-hidden p-5 transition-all duration-500 border border-border cursor-pointer ${isNew
        ? "bg-linear-to-br from-brand/10 via-card to-transparent border-brand/30 shadow-brand/20"
        : "bg-card/50 hover:bg-card hover:border-border"
        }`}
    >
      <div className="flex items-center gap-5 relative z-10">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full p-1 bg-linear-to-br from-brand/30 to-transparent ring-2 ring-border">
            <img
              src={resolvedAvatar}
              alt={notification.fromUserId}
              className="w-full h-full rounded-full object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center p-1.5 shadow-lg ${isNew ? "bg-brand ring-4 ring-background" : "bg-muted ring-4 ring-background"
            }`}>
            <IconForType type={notification.type} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-foreground/90 text-lg leading-snug">
            <span className="font-extrabold text-foreground text-[19px]">{resolvedName}</span>{" "}
            <br />
            <span className="text-muted-foreground font-medium tracking-tight">
              {getNotificationText(notification)}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-sm font-black uppercase tracking-widest text-brand-muted">{timeAgo(notification.createdAt)}</p>
            {isNew && (
              <>
                <div className="w-1 h-1 rounded-full bg-brand/30" />
                <span className="text-[10px] font-black uppercase text-brand tracking-[0.2em] px-2 py-0.5 rounded-full bg-brand/10">{t("new-notifications")}</span>
              </>
            )}
          </div>
        </div>

        {postImage && (
          <div className="flex-shrink-0">
            <img
              src={postImage}
              alt="Post"
              className="w-18 h-18 rounded-xl object-cover border border-border shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
