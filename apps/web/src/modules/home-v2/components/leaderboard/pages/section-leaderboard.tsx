import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { WidgetCard } from "@/modules/shared/components/common/widget-card";
import { LeaderboardList } from "../components";

export function SectionLeaderboard() {
  const t = useTranslations("home");

  return (
    <WidgetCard>
      <div className="flex items-center gap-2.5 px-1">
        <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 transition-colors hover:bg-yellow-500/20">
          <Trophy size={18} />
        </div>
        <h3 className="font-bold text-foreground text-[18px] tracking-tight">
          {t("leaderboard")}
        </h3>
      </div>

      <div className="w-full h-full">
        <LeaderboardList />
      </div>
    </WidgetCard>
  );
}
