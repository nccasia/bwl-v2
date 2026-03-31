import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { UserAvatar } from "../../UserAvatar";
import { fetchTopAuthors, TopAuthor } from "@/app/api/services/HomeService";
import { useTranslations } from "next-intl";

export default function Stories() {
  const [authors, setAuthors] = useState<TopAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("stories");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchTopAuthors();
        setAuthors(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="mb-6 rounded-2xl bg-muted/30 backdrop-blur-xl border border-border p-6 overflow-hidden relative shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Trophy className="w-20 h-20 text-brand" />
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-foreground font-bold text-lg">{t("title")}</h3>
      </div>

      <div className="flex gap-6 overflow-x-auto pt-4 pb-4 scrollbar-hide relative z-10">
        {loading ? (
          <div className="flex items-center gap-4 py-4">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
            <span className="text-muted-foreground text-sm">{t("loading-contributors")}</span>
          </div>
        ) : authors.length > 0 ? (
          authors.map((author, index) => (
            <button
              key={author.username}
              className="flex flex-col items-center gap-3 shrink-0 group"
              onClick={() => window.location.href = `/profile/${author.username}`}
            >
              <div className="relative p-[3px] rounded-full bg-linear-to-tr from-purple-500 via-pink-500 to-orange-500 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                <div className="p-0.5 rounded-full bg-background">
                  <UserAvatar 
                    name={author.username} 
                    avatarUrl={author.avatar ?? undefined} 
                    size="lg" 
                  />
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-background shadow-xl text-black
                  ${index === 0 ? "bg-yellow-500" : 
                    index === 1 ? "bg-gray-300" : 
                    index === 2 ? "bg-orange-600 text-white!" : "bg-white/20 text-white!"}`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[16px] font-bold text-foreground max-w-[80px] truncate group-hover:text-brand transition-colors">
                  {author.username}
                </span>
                <span className="text-[12px] text-muted-foreground font-medium">
                  {author.postCount} {t("post-contributors")}
                </span>
              </div>
            </button>
          ))
        ) : (
          <p className="text-gray-400 text-sm py-4">{t("no-data")}</p>
        )}
      </div>
    </div>
  );
}
