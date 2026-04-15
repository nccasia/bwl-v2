"use client";

import { Skeleton, Tabs } from "@heroui/react";
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
        <div
          className="p-1.5 rounded-lg transition-colors cursor-pointer"
          onClick={() => state.setSelectedChannelId(null)}
        >
          <Hash className="w-4 h-4" />
        </div>
        <h3
          className="font-bold text-[15px] text-foreground tracking-tight cursor-pointer"
          onClick={() => state.setSelectedChannelId(null)}
        >
          {t("channelsList")}
        </h3>
      </div>

      <div className="space-y-4">
        {state.isLoadingChannels ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex justify-between items-center px-2">
                  <Skeleton className="h-4 w-1/2 rounded-full" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Tabs
              aria-label="Channels selection"
              selectedKey={state.selectedChannelId || "all"}
              onSelectionChange={(key) =>
                state.setSelectedChannelId(
                  key === "all" ? null : key.toString(),
                )
              }
              className="w-full"
            >
              <Tabs.ListContainer className="w-full">
                <Tabs.List className="flex flex-col w-full p-0 gap-1 border-none bg-transparent">
                  <Tabs.Tab
                    id="all"
                    className="h-11 w-full justify-start px-3 data-[selected=true]:bg-transparent group relative flex items-center cursor-pointer overflow-hidden rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between w-full font-bold text-[15px] transition-colors z-10">
                      <span>{t("allChannels")}</span>
                    </div>
                    <Tabs.Indicator className="absolute inset-0 w-full h-full shadow-none rounded-xl z-0" />
                  </Tabs.Tab>

                  {state.channels.map((channel) => (
                    <Tabs.Tab
                      id={channel.id}
                      key={channel.id}
                      className="h-11 w-full justify-start px-3 data-[selected=true]:bg-transparent group relative flex items-center cursor-pointer overflow-hidden rounded-xl transition-colors"
                    >
                      <div className="flex items-center w-full font-bold text-[15px] transition-colors z-10">
                        <span>#{channel.name}</span>
                      </div>
                      <Tabs.Indicator className="absolute inset-0 w-full h-full shadow-none rounded-xl z-0" />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
            {state.channels.length === 0 && (
              <EmptyState
                title={t("noChannels")}
                className="py-6 bg-transparent border-none"
              />
            )}
          </div>
        )}
      </div>

      <div className="h-1 rounded-full mt-6 w-3/4 mx-auto opacity-30" />
    </WidgetCard>
  );
}
