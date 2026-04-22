"use client";

import { Card } from "@heroui/react";
import { Palette, Check } from "lucide-react";
import { useBrandColor, PALETTES, BrandColor } from "../hooks/use-brand-color";

export const BrandColorSection = () => {
  const { color: currentColor, setColor } = useBrandColor();

  return (
    <Card className="p-6 bg-zinc-100/50 dark:bg-zinc-900/50 border-none mt-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">Brand Color</h3>
          <p className="text-sm text-zinc-500">
            Choose your preferred accent color
          </p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-brand-start">
          <Palette size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(
          Object.entries(PALETTES) as [BrandColor, typeof PALETTES.purple][]
        ).map(([key, palette]) => (
          <div key={key} className="flex flex-col gap-3">
            <button
              onClick={() => setColor(key)}
              className={`group relative h-32 rounded-3xl transition-all duration-300 overflow-hidden ${
                currentColor === key
                  ? "ring-2 ring-brand-start ring-offset-4 ring-offset-white dark:ring-offset-zinc-900 shadow-xl"
                  : "hover:scale-105 opacity-80 hover:opacity-100"
              }`}
              style={{
                background: `linear-gradient(135deg, ${palette.start} 0%, ${palette.end} 100%)`,
              }}
            >
              {currentColor === key && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Check className="text-brand-start font-bold" size={24} />
                  </div>
                </div>
              )}
            </button>
            <span
              className={`text-sm font-bold text-center ${currentColor === key ? "text-brand-start" : "text-zinc-500"}`}
            >
              {palette.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
