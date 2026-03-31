"use client"

import { useEffect, useState } from "react"

type Theme = "light" | "dark"
const KEY = "bwl_theme"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme) ?? "light"
    setTheme(saved)
    document.documentElement.classList.toggle("dark", saved === "dark")
  }, [])

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem(KEY, next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  return { theme, toggle }
}
