import type { User } from "@/schemas/login/auth-schema"
import { apiClient } from "@/libs/api-client"

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/profile")
    
    if (!response.isSuccess || !response.data) {
      const message = Array.isArray(response.message)
        ? response.message.join(", ")
        : response.message || "Failed to fetch profile"
      throw new Error(message)
    }

    return response.data
  },
}
