import { TrendingUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Channel } from "@/types/gallery";
import { useRouter } from "next/navigation";
import { fetchTopChannels } from "@/app/api/services/HomeService";
import { useTranslations } from "next-intl";

export default function TrendingTopics() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations("top-channels");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchTopChannels(5);
        setChannels(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-brand" />
        <h3 className="text-foreground font-semibold">{t("title")}</h3>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          </div>
        ) : channels.length > 0 ? (
          channels.map((channel) => (
            <button
              key={channel.channelId}
              className="w-full text-left p-2.5 rounded-xl hover:bg-muted transition-all group flex flex-col"
              onClick={() => router.push(`/?channelId=${channel.channelId}`)}
            >
              <span className="text-brand group-hover:text-brand-light font-semibold text-[19px] leading-tight">
                #{channel.name}
              </span>
              <span className="text-[16px] text-muted-foreground font-medium">{channel.count} {t("post-count")}</span>
            </button>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">{t("no-data")}</p>
        )}
      </div>
    </div>
  );
}
