"use client";

import { Card } from "@heroui/react";
import { Bell, Zap } from "lucide-react";
import { useAppearanceSection } from "../hooks";

export const QuickAccessSection = () => {
  const { state, actions } = useAppearanceSection();
  return (
    <Card className="p-6 bg-zinc-100/50 dark:bg-zinc-900/50 border-none h-full transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">Quick Access</h3>
          <p className="text-sm text-zinc-500 font-medium font-medium">
            Toggle settings
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 text-brand-start shadow-sm border border-zinc-200 dark:border-zinc-700">
          <Zap size={20} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div
          onClick={() => actions.setNotifications(!state.notifications)}
          className="flex items-center justify-between bg-zinc-200/50 dark:bg-zinc-800/50 p-5 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-700/50 cursor-pointer transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl transition-colors ${state.notifications ? "bg-brand-start text-white" : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500"}`}
            >
              <Bell size={18} />
            </div>
            <span className="font-bold text-sm">Notifications</span>
          </div>

          <div
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${state.notifications ? "bg-brand-start" : "bg-zinc-400 dark:bg-zinc-600"}`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${state.notifications ? "translate-x-6" : "translate-x-0"}`}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
