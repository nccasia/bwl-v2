"use client";

import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@heroui/react";
import { Hash, ChevronDown, Lock } from "lucide-react";
import { useAllChannels } from "@/modules/home-v2/hooks/use-all-channels";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/login/auth-store";
import { cn } from "@/utils/utils";

interface SidebarChannelsProps {
  isExpanded?: boolean;
}

export function SidebarChannels({ isExpanded = true }: SidebarChannelsProps) {
  const { state } = useAllChannels();
  const t = useTranslations("home");
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!isExpanded) {
      setOpen(false);
    }
  }, [isExpanded]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-not-allowed opacity-60 transition-all duration-200">
        <div className="p-1.5 rounded-lg bg-muted-foreground/10 shrink-0">
          <Lock className="w-[18px] h-[18px] text-muted-foreground" />
        </div>
        <div className={cn(
          "flex flex-col min-w-0",
          "transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          <span className="font-bold text-[13px] text-muted-foreground leading-tight whitespace-nowrap">
            {t("channelsList")}
          </span>
          <span className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5 whitespace-nowrap">
            Đăng nhập để xem list channel
          </span>
        </div>
      </div>
    );
  }

  if (state.isLoadingChannels) {
    return (
      <div className="px-3 py-3">
        <Skeleton className="h-[33px] w-full rounded-xl" />
      </div>
    );
  }

  const selectedChannel = state.channels.find((c: any) => c.id === state.selectedChannelId);
  const displayLabel = state.selectedChannelId
    ? `#${selectedChannel?.name || state.selectedChannelId}`
    : t("allChannels");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { if (isExpanded) setOpen((v) => !v); }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 outline-none cursor-pointer group",
          isExpanded
            ? cn("bg-content2 hover:bg-content3 border border-transparent", open && "border-brand-start/20 bg-content3")
            : "border border-transparent",
          state.selectedChannelId
            ? "text-brand-start"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <div className={cn(
          "p-1.5 rounded-lg transition-colors shrink-0",
          state.selectedChannelId ? "bg-brand-start/10" : "bg-muted-foreground/10"
        )}>
          <Hash className={cn(
            "w-[18px] h-[18px] transition-colors",
            state.selectedChannelId ? "text-brand-start" : "text-muted-foreground group-hover:text-brand-start"
          )} />
        </div>

        <span className={cn(
          "font-bold text-[14px] transition-all duration-200 truncate whitespace-nowrap",
          "transition-opacity duration-200",
          state.selectedChannelId ? "text-brand-start" : "text-foreground",
          isExpanded ? "opacity-100" : "opacity-0",
        )}>
          {displayLabel}
        </span>

        <ChevronDown
          size={15}
          className={cn(
            "ml-auto transition-all duration-200 shrink-0",
            "transition-opacity duration-200",
            isExpanded ? "opacity-100" : "opacity-0",
            open ? "rotate-180 text-brand-start" : "text-muted-foreground",
          )}
        />
      </button>

      {/* Dropdown popover */}
      {open && isExpanded && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[200] bg-background border border-divider rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-1.5 max-h-[260px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
            {/* All Channels */}
            <button
              onClick={() => { state.setSelectedChannelId(null); setOpen(false); }}
              className={cn(
                "flex items-center gap-3 w-full py-2.5 px-3 rounded-xl transition-all duration-150 cursor-pointer text-left",
                !state.selectedChannelId
                  ? "bg-brand-start/15 text-brand-start"
                  : "hover:bg-content2 text-foreground"
              )}
            >
              <div className="p-1 rounded-lg bg-muted-foreground/10 shrink-0">
                <Hash size={12} className="text-muted-foreground" />
              </div>
              <span className="font-semibold text-[13.5px]">{t("allChannels")}</span>
            </button>

            {state.channels.length > 0 && (
              <div className="h-px bg-divider/50 mx-2 my-1" />
            )}

            {/* Channel list */}
            {state.channels.map((channel: any) => (
              <button
                key={channel.id}
                onClick={() => { state.setSelectedChannelId(channel.id); setOpen(false); }}
                className={cn(
                  "flex items-center justify-between w-full py-2.5 px-3 rounded-xl transition-all duration-150 cursor-pointer text-left",
                  state.selectedChannelId === channel.id
                    ? "bg-brand-start/15 text-brand-start"
                    : "hover:bg-content2 text-foreground"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-brand-start/50 text-[13px] shrink-0">#</span>
                  <span className="font-semibold text-[13.5px] truncate">
                    {channel.name || channel.id}
                  </span>
                </div>
                {channel.postCount > 0 && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0 ml-2 leading-tight">
                    {channel.postCount}
                  </span>
                )}
              </button>
            ))}

            {state.channels.length === 0 && (
              <p className="text-center text-xs text-muted-foreground/60 py-4">
                Không có channels
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
