import type { User } from "@/schemas/login/auth-schema"
import { apiClient } from "@/libs/api-client"

export interface MezonProfile {
  username?: string;
  display_name?: string;
  email?: string;
  avatar?: string;
  mezon_id: string | number;
}

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

  getMezonProfile: async (tokens: any) => {

    const profileRes = await fetch(`${process.env.MEZON_AUTH_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${typeof tokens === 'string' ? tokens : tokens.accessToken}` }
    });

    if (!profileRes.ok) return null;
    const profile = await profileRes.json() as MezonProfile;

    const idToken = typeof tokens === 'string' ? null : (tokens.idToken || tokens.id_token);
    const beAccessToken = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/mezon-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    })
      .then(res => res.json())
      .then(data => data.data?.accessToken || data.accessToken)
      .catch((e) => {
        console.error("Mezon login error:", e);
        throw new Error(e);
      });

    return {
      id: String(profile.mezon_id),
      name: profile.username || profile.display_name,
      email: profile.email,
      image: profile.avatar,
      emailVerified: true,
      accessToken: beAccessToken,
    };
  },
}

