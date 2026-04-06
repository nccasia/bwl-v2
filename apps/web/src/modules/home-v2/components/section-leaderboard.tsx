"use client";

import { Trophy } from "lucide-react";
import { Tabs, Tab, TabList, TabPanel } from "@heroui/react";
import { useTranslations } from "next-intl";
import { WidgetCard } from "@/modules/shared/components/common/widget-card";
import { EmptyState } from "@/modules/shared/components/common/empty-state";

export function SectionLeaderboard() {
  const t = useTranslations("home");

  return (
    <WidgetCard>
      <div className="flex items-center gap-2.5 px-1 mb-6">
        <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 transition-colors hover:bg-yellow-500/20">
          <Trophy size={18} />
        </div>
        <h3 className="font-bold text-foreground text-[15px] tracking-tight">
          {t("leaderboard")}
        </h3>
      </div>

      <div className="w-full">
        <Tabs aria-label="Leaderboard intervals">
          <TabList className="flex p-1 bg-content2/50 rounded-full w-full">
            <Tab
              id="7days"
              className="flex-1 w-full py-2 font-bold text-[11px] text-muted-foreground data-[selected=true]:bg-content1 data-[selected=true]:text-primary data-[selected=true]:shadow-sm rounded-full transition-all cursor-pointer focus:outline-none text-center"
            >
              {t("7days")}
            </Tab>
            <Tab
              id="30days"
              className="flex-1 w-full py-2 font-bold text-[11px] text-muted-foreground data-[selected=true]:bg-content1 data-[selected=true]:text-primary data-[selected=true]:shadow-sm rounded-full transition-all cursor-pointer focus:outline-none text-center"
            >
              {t("30days")}
            </Tab>
            <Tab
              id="1year"
              className="flex-1 w-full py-2 font-bold text-[11px] text-muted-foreground data-[selected=true]:bg-content1 data-[selected=true]:text-primary data-[selected=true]:shadow-sm rounded-full transition-all cursor-pointer focus:outline-none text-center"
            >
              {t("1year")}
            </Tab>
          </TabList>

          <TabPanel id="7days" className="pt-4 outline-none">
            <EmptyState 
              title={t("noLeaderboard")} 
              className="py-10 bg-transparent border-none"
            />
          </TabPanel>
          <TabPanel id="30days" className="pt-4 outline-none">
            <EmptyState 
              title={t("updatingData")} 
              className="py-10 bg-transparent border-none"
            />
          </TabPanel>
          <TabPanel id="1year" className="pt-4 outline-none">
            <EmptyState 
              title={t("updatingData")} 
              className="py-10 bg-transparent border-none"
            />
          </TabPanel>
        </Tabs>
      </div>
    </WidgetCard>
  );
}


