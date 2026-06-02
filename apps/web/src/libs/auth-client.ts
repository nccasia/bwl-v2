import { createAuthClient } from "better-auth/react"
import { genericOAuthClient, customSessionClient } from "better-auth/client/plugins"
import type { auth } from "@/libs/auth"

function getAuthBaseURL() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`
  }

  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth`
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [genericOAuthClient(), customSessionClient<typeof auth>()],
})

export type { Session } from "./auth"
