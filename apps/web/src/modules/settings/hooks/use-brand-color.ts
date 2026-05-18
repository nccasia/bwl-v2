import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BrandColor = 'purple' | 'blue' | 'orange' | 'green'

interface BrandPalette {
  start: string
  end: string
  name: string
}

export const PALETTES: Record<BrandColor, BrandPalette> = {
  purple: { start: '#a855f7', end: '#6366f1', name: 'Neon Purple' },
  blue: { start: '#3b82f6', end: '#2dd4bf', name: 'Electric Blue' },
  orange: { start: '#f97316', end: '#ef4444', name: 'Sunset Orange' },
  green: { start: '#10b981', end: '#3b82f6', name: 'Emerald Green' },
}

interface BrandColorState {
  color: BrandColor
  setColor: (color: BrandColor) => void
  applyColor: (color: BrandColor) => void
}

export const useBrandColor = create<BrandColorState>()(
  persist(
    (set, get) => ({
      color: 'purple',
      setColor: (color) => {
        set({ color })
        get().applyColor(color)
      },
      applyColor: (color) => {
        if (typeof document === 'undefined') return
        const palette = PALETTES[color]
        document.documentElement.style.setProperty('--brand-start', palette.start)
        document.documentElement.style.setProperty('--brand-end', palette.end)
      },
    }),
    {
      name: 'brand-color-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.applyColor(state.color)
      },
    }
  )
)
