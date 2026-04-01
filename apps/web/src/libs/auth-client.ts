import { createAuthClient } from "better-auth/client"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const authClient = createAuthClient({
  baseURL: `${APP_URL}/api/auth`,
})

export type { Session } from "./auth"
