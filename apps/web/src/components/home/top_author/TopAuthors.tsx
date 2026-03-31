import { Award, Loader2 } from "lucide-react";
import { UserAvatar } from "../../UserAvatar";
import Link from "next/link";
import { useTopAuthor } from "./hook/useTopAuthor";
import { useTranslations } from "next-intl";
import { TopAuthor, Period } from "@/app/api/services/HomeService";

export default function TopAuthors() {
  const { state, handlers } = useTopAuthor();
  const t = useTranslations("top-author");
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-brand" />
        <h3 className="text-foreground font-semibold flex-1 text-base">{t("title")}</h3>
      </div>

      <div className="flex gap-1 mb-6 p-1 bg-muted rounded-xl border border-border">
        {handlers.periods.map((p) => (
          <button
            key={p.id}
            onClick={() => handlers.setPeriod(p.id as Period)}
            className={`flex-1 text-xs py-2 rounded-lg transition-all font-black uppercase tracking-wider
              ${state.period === p.id 
                ? "bg-background text-brand border border-border shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {state.loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : state.authors.length > 0 ? (
          state.authors.slice(0, 5).map((author, index) => (
            <Link 
              key={author.username} 
              href={`/profile/${author.username}`}
              className="flex items-center gap-3 group hover:bg-muted/50 p-1 rounded-xl transition-all"
            >
              <div className="relative">
                <UserAvatar 
                  name={author.displayName || author.username} 
                  avatarUrl={author.avatar ?? undefined} 
                  size="md" 
                />
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black border-2 border-background shadow-lg
                  ${index === 0 ? "bg-yellow-500 text-black border-yellow-500/50" : 
                    index === 1 ? "bg-gray-300 text-black border-gray-300/50" : 
                    index === 2 ? "bg-orange-600 text-white border-orange-600/50" : "bg-muted text-muted-foreground border-border/50"}`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-semibold text-foreground truncate group-hover:text-brand transition-colors">
                  {author.displayName || author.username}
                </h4>
                <p className="text-[16px] text-muted-foreground font-medium leading-tight">{author.postCount} {t("post-count-author")}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-[16px] text-muted-foreground text-center py-6">{t("no-data")}</p>
        )}
      </div>
    </div>
  );
}
