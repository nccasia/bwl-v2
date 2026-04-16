"use client";

import { Spinner, ScrollShadow } from "@heroui/react";
import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { Trophy } from "lucide-react";
import { StoriesProps } from "../../../types/home-v2";
import { useTranslations } from "next-intl";
import { WidgetCard } from "@/modules/shared/components/common/widget-card";

export function Stories({ authors = [], isLoading }: StoriesProps) {
  const t = useTranslations("home");

  return (
    <WidgetCard className="mb-6 relative group/stories">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover/stories:opacity-[0.05] transition-opacity duration-500">
        <Trophy className="w-24 h-24 text-primary" />
      </div>

      <div className="flex items-center gap-2.5 relative z-10 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/10 transition-colors group-hover/stories:bg-primary/20">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-foreground font-bold text-[15px] tracking-tight">
          {t("topContributors")}
        </h3>
      </div>

      <ScrollShadow
        orientation="horizontal"
        className="w-full h-full pb-2 -mb-2 scrollbar-hide relative z-10"
        hideScrollBar
      >
        {isLoading ? (
          <div className="flex items-center justify-center w-full py-10">
            <Spinner size="sm" color="accent" />
          </div>
        ) : authors.length > 0 ? (
          <div className="flex items-center gap-5 py-4 px-1">
            {authors.map((author) => (
              <button
                key={author.id}
                onClick={() => console.log("click contributor", author.id)}
                className="group flex flex-col items-center gap-3 shrink-0 transition-all duration-300 active:scale-95 outline-none"
              >
                <div className="relative p-[3px] rounded-full group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 rounded-full bg-linear-to-tr from-primary via-purple-500 to-pink-500 animate-gradient-xy shadow-lg shadow-primary/20" />

                  <div className="relative p-0.5 rounded-full bg-background ring-1 ring-white/10">
                    <UserAvatar className="w-14 h-14" />
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-0.5">
                  <span className="text-[13px] font-bold text-foreground max-w-[70px] truncate leading-tight group-hover:text-primary transition-colors">
                    {author.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-black tracking-wider uppercase opacity-60">
                    {author.pts} {t("pts")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full py-10 text-muted-foreground text-[13px] font-medium italic opacity-40">
            {t("noContributors")}
          </div>
        )}
      </ScrollShadow>
    </WidgetCard>
  );
}
