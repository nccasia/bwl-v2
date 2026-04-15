"use client";

import { Skeleton } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTopChannels } from "../hooks/use-top-channels";
import { WidgetCard } from "@/modules/shared/components/common/widget-card";
import { EmptyState } from "@/modules/shared/components/common/empty-state";

export function TopChannels() {
  const t = useTranslations("home");
  const { state } = useTopChannels();

  return (
    <WidgetCard>
      <div className="flex items-center gap-2 mb-6 px-1">
        <div className="p-1.5 rounded-lg bg-orange-500/10 transition-colors hover:bg-orange-500/20 cursor-pointer">
          <TrendingUp className="w-4 h-4 text-orange-500" />
        </div>
        <h3 className="font-bold text-[15px] text-foreground tracking-tight cursor-pointer">
          {t("topChannels")}
        </h3>
      </div>

      <div className="space-y-5">
        {state.isLoadingTop ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3.5 w-1/4 rounded-full opacity-60" />
              </div>
            ))
        ) : state.topChannels.length > 0 ? (
          state.topChannels.map((channel) => (
            <div
              key={channel.id}
              className={`group cursor-pointer p-2 -mx-2 rounded-xl transition-all duration-300 `}
            >
              <p
                className={`font-black text-[17px] transition-colors tracking-tight text-orange-500 group-hover:text-orange-600`}
              >
                #{channel.name}
              </p>
              <p className="text-xs font-bold text-muted-foreground mt-0.5 opacity-80">
                {t("postsCount", { count: channel.postCount })}
              </p>
            </div>
          ))
        ) : (
          <EmptyState
            title={t("noTopChannels")}
            className="py-6 bg-transparent border-none"
          />
        )}
      </div>
    </WidgetCard>
  );
}
