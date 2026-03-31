"use client";

import { useTheme } from "next-themes";
import { useCustomColor } from "@/components/theme/CustomColorProvider";

export function useThemeColors() {
  const { resolvedTheme } = useTheme();
  const { accentColor: brandColor } = useCustomColor();

  const activeTheme = resolvedTheme === "dark" ? "dark" : "light";

  const colors = {
    light: {
      bg: "#FFFFFF",
      bgSecondary: "#F4F7FA",
      text: "#1A1A1A",
      textMuted: "#6B7280",
      border: "rgba(26, 26, 26, 0.1)",
      cardBg: "#F4F7FA",
      cardBorder: "rgba(26, 26, 26, 0.15)",
      hoverBg: `${brandColor}0D`, 
      inputBg: "#F4F7FA",
      inputBorder: "rgba(26, 26, 26, 0.2)",
      accent: brandColor,
    },
    dark: {
      bg: "#0B0E14",
      bgSecondary: "#1C1F26",
      text: "#E4E6EB",
      textMuted: "#9CA3AF",
      border: "rgba(255, 255, 255, 0.05)",
      cardBg: "#1C1F26",
      cardBorder: "rgba(255, 255, 255, 0.1)",
      hoverBg: "rgba(255, 255, 255, 0.05)",
      inputBg: "rgba(255, 255, 255, 0.05)",
      inputBorder: "rgba(255, 255, 255, 0.1)",
      accent: brandColor,
    },
  };

  return colors[activeTheme];
}
