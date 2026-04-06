"use client";

import { Sun, LogOut } from "lucide-react";

import { Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import { SIDEBAR_ITEMS } from "@/modules/shared/constants/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  return (
    <aside className="w-[320px] h-screen fixed left-0 top-0 border-r border-divider bg-background flex flex-col p-8 z-50">
      <div className="flex items-center gap-4 px-4 mb-12 group cursor-pointer">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <img
            src="/assets/images/mezon-logo.webp"
            alt="Mezon Logo"
            className="w-full h-full object-contain rounded-full shadow-[0_0_15px_rgba(217,70,239,0.2)] group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="flex flex-col leading-none">
          <span className="text-2xl font-black tracking-tighter font-serif bg-linear-to-r from-foreground to-foreground/40 bg-clip-text text-transparent italic">
            BWL
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mt-0.5">
            Social
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const label = t(item.translationKey);
          return (
            <Link
              key={item.translationKey}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group hover:bg-content2 active:scale-95",
                isActive
                  ? "bg-primary/10 text-primary shadow-xs shadow-primary/5"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "fill-primary/10" : "",
                )}
              />
              <span className="font-bold text-[15px] tracking-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-divider space-y-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 px-4 py-7 rounded-2xl text-muted-foreground hover:text-foreground font-bold text-[15px] border-none hover:bg-content2 transition-all transition-duration-300"
        >
          <Sun className="w-5 h-5" />
          {t("lightMode")}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 px-4 py-7 rounded-2xl text-muted-foreground hover:text-danger font-bold text-[15px] border-none hover:bg-danger/10 transition-all transition-duration-300"
          onPress={() => console.log("logout")}
        >
          <LogOut className="w-5 h-5" />
          {t("logout")}
        </Button>
      </div>
    </aside>
  );
}
