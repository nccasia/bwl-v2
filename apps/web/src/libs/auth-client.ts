import { createAuthClient } from "better-auth/react"
import { genericOAuthClient } from "better-auth/client/plugins"

function getAuthBaseURL() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`
  }

  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth`
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [genericOAuthClient()],
})

export type { Session } from "./auth"
