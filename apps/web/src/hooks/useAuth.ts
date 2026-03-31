"use client"

import { useEffect, useState } from "react"

export interface AuthUser {
  sub: string
  displayName: string
  username?: string
  name?: string
  picture?: string
  avatar?: string   // Mezon avatar URL
  accessToken: string
}

const STORAGE_KEY = "bwl_user"
const AUTH_EVENT = "bwl_auth_changed"

export function saveUser(user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event(AUTH_EVENT))
  }
}

export function clearUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event(AUTH_EVENT))
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => {
      setUser(getUser())
      setReady(true)
    }

    sync()

    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener("storage", sync) // Sync across tabs

    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const logout = () => {
    clearUser()
    setUser(null)
  }

  return { user, ready, logout }
}
