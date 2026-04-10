"use client";

import { Skeleton } from "@heroui/react";
import { Hash } from "lucide-react";
import { useTopChannels } from "../hooks/use-top-channels";
import { useTranslations } from "next-intl";
import { WidgetCard } from "@/modules/shared/components/common/widget-card";
import { EmptyState } from "@/modules/shared/components/common/empty-state";

export function ChannelsSection() {
  const { state } = useTopChannels();
  const t = useTranslations("home");

  return (
    <WidgetCard>
      <div className="flex items-center gap-2 mb-6 px-1">
        <div className="p-1.5 rounded-lg bg-primary/10 transition-colors hover:bg-primary/20">
          <Hash className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-[15px] text-foreground tracking-tight">
          {t("channelsList")}
        </h3>
      </div>


      <div className="space-y-4">
        {state.isLoadingChannels ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/2 rounded-full" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            ))
        ) : state.channels.length > 0 ? (
          state.channels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center justify-between group cursor-pointer"
            >
              <span className="text-[15px] font-bold text-muted-foreground group-hover:text-primary transition-all duration-300">
                {channel.name}
              </span>
              <div className="px-2.5 py-1 rounded-full bg-content2 border border-divider/50 text-[11px] font-black text-muted-foreground group-hover:text-foreground group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                {channel.postCount}
              </div>
            </div>
          ))
        ) : (
          <EmptyState 
            title={t("noChannels")} 
            className="py-6 bg-transparent border-none"
          />
        )}
      </div>
      <div className="h-1 bg-primary/10 rounded-full mt-6 w-3/4 mx-auto opacity-30" />
    </WidgetCard>
  );
}

