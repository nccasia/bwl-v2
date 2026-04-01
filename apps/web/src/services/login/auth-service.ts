import type { User } from "@/schemas/login"
import { authClient } from "@/libs/auth-client"

const BE_URL = process.env.NEXT_PUBLIC_API_URL

export const authService = {
  getMezonLoginUrl: (): string => {
    return `${BE_URL}/auth/mezon`
  },

  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${BE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch profile")
    }

    return response.json()
  },


  createSession: (sub: string, accessToken: string) =>
    authClient.$fetch("/sign-in/mezon", {
      method: "POST",
      body: { sub, accessToken },
    }),

  getSession: () => authClient.getSession(),
  signOut: () => authClient.signOut(),
}
