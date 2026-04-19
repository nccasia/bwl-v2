import React from "react";
import { BWLLogoProps } from "../../types/bwl-logo";

export const BWLLogo: React.FC<BWLLogoProps> = ({
  className = "",
  size = 48,
  useGradient = false,
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div
          className={`w-full h-full rounded-full p-[3px] ${useGradient ? "bg-brand-gradient shadow-lg shadow-purple-500/20" : "bg-zinc-200 dark:bg-zinc-700"}`}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
            <div
              className={`w-[70%] h-[70%] rounded-full border-[3px] ${useGradient ? "border-brand-start" : "border-zinc-300 dark:border-zinc-600"}`}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col leading-[0.8]">
        <span
          className={`text-3xl font-black italic tracking-tighter ${useGradient ? "text-brand-gradient" : "text-zinc-900 dark:text-white"}`}
        >
          BWL
        </span>
        <span
          className={`text-[11px] font-black tracking-[0.4em] uppercase mt-1 ${useGradient ? "text-brand-gradient opacity-90" : "text-zinc-500"}`}
        >
          SOCIAL
        </span>
      </div>
    </div>
  );
};
