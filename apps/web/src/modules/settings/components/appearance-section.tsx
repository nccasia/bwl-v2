"use client";

import { Card } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { BWLLogo } from "@/modules/shared/components/common/bwl-logo";
import { useAppearanceSection } from "../hooks";

export const AppearanceSection = () => {
  const { state, actions } = useAppearanceSection();
  if (!state.mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="col-span-1 md:col-span-2 p-6 bg-zinc-100/50 dark:bg-zinc-900/50 border-none transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold">Appearance</h3>
            <p className="text-sm text-zinc-500 font-medium">
              Switch between light and dark mode
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 text-brand-start shadow-sm border border-zinc-200 dark:border-zinc-700">
            <Moon size={20} />
          </div>
        </div>

        <div className="flex items-center justify-between bg-zinc-200/50 dark:bg-zinc-800/50 p-4 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-700/50 transition-colors">
          <div
            className={`flex items-center gap-3 cursor-pointer transition-opacity ${!state.isDark ? "opacity-100" : "opacity-40"}`}
            onClick={() => actions.setTheme("light")}
          >
            <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-700 shadow-lg">
              <Sun
                size={20}
                className={!state.isDark ? "text-orange-500" : "text-zinc-500"}
              />
            </div>
            <span className="font-bold text-sm">Light Mode</span>
          </div>

          <div
            onClick={actions.toggleTheme}
            className="relative w-20 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 p-1 cursor-pointer transition-all duration-500 group"
          >
            <div
              className={`absolute top-1 left-1 w-8 h-8 rounded-full bg-white shadow-xl transform transition-transform duration-500 flex items-center justify-center ${state.isDark ? "translate-x-10" : "translate-x-0"}`}
            >
              {state.isDark ? (
                <Moon size={16} className="text-brand-start fill-brand-start" />
              ) : (
                <Sun size={16} className="text-orange-500 fill-orange-500" />
              )}
            </div>
          </div>

          <div
            className={`flex items-center gap-3 cursor-pointer transition-opacity ${state.isDark ? "opacity-100" : "opacity-40"}`}
            onClick={() => actions.setTheme("dark")}
          >
            <span className="font-bold text-sm">Dark Mode</span>
            <div className="p-2.5 rounded-2xl bg-brand-start shadow-lg shadow-brand-start/40">
              <Moon size={20} className="text-white" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="col-span-1 p-8 flex flex-col items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 border-none text-center transition-colors">
        <div className="mb-6 p-6 rounded-[2.5rem] bg-white dark:bg-zinc-800 shadow-2xl relative overflow-hidden group border border-zinc-200 dark:border-zinc-700">
          <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
          <BWLLogo size={64} useGradient />
        </div>
        <h4 className="text-lg font-black italic tracking-tight mb-1">
          {state.isDark ? "Dark Theme" : "Light Theme"}
        </h4>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Active
          </p>
        </div>
      </Card>
    </div>
  );
};
