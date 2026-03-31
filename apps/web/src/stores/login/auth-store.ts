import { User } from "@/schemas/login"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  setSession: (user: User | null) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      
      setHasHydrated: (state) => set({ hasHydrated: state }),

      setSession: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      clearSession: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true)
      },
    }
  )
)
