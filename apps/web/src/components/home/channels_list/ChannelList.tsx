import { Hash, Loader2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChannels } from "@/app/api/download/Services/homeServices";
import { useTranslations } from "next-intl";

export default function ChannelList() {
  const router = useRouter();
  const t = useTranslations("channels-list");
  const { channels, loading } = useChannels();
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="w-5 h-5 text-brand" />
        <h3 className="text-foreground font-semibold text-base">{t("title")}</h3>
      </div>

      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : channels.length > 0 ? (
          channels.map((channel) => (
            <button
              key={channel.channelId}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-all group"
              onClick={() => router.push(`/?channelId=${channel.channelId}`)}
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground group-hover:text-brand transition-colors font-medium text-[18px]">
                  {channel.name}
                </span>
                <span className="text-[16px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground group-hover:text-brand/50 transition-colors">
                  {channel.count}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
            </button>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">{t("no-channel")}</p>
        )}
      </div>
    </div>
  );
}
