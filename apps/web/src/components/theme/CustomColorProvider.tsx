"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CustomColorContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
  resetAccentColor: () => void;
}

const CustomColorContext = createContext<CustomColorContextType | undefined>(undefined);

const DEFAULT_COLOR = "#A855F7"; 

export function CustomColorProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState(DEFAULT_COLOR);

  useEffect(() => {
    const savedColor = localStorage.getItem("accent-color");
    if (savedColor) {
      setAccentColorState(savedColor);
      applyColor(savedColor);
    }
  }, []);

  const applyColor = (color: string) => {
    const root = document.documentElement;

    root.style.setProperty("--accent", color);
    root.style.setProperty("--accent-hover", color);

    root.style.setProperty("--primary", color);

    root.style.setProperty("--ring", color);

    root.style.setProperty("--sidebar-primary", color);
    root.style.setProperty("--sidebar-ring", color);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem("accent-color", color);
    applyColor(color);
  };

  const resetAccentColor = () => {
    setAccentColor(DEFAULT_COLOR);
  };

  return (
    <CustomColorContext.Provider value={{ accentColor, setAccentColor, resetAccentColor }}>
      {children}
    </CustomColorContext.Provider>
  );
}

export function useCustomColor() {
  const context = useContext(CustomColorContext);
  if (context === undefined) {
    throw new Error("useCustomColor must be used within a CustomColorProvider");
  }
  return context;
}
