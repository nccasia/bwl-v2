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
  handleResponse: <T>(response: any): T => {
    if (!response.isSuccess || !response.data) {
      const message = Array.isArray(response.message)
        ? response.message.join(", ")
        : response.message || "Request failed";
      throw new Error(message);
    }
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/profile");
    return userService.handleResponse(response);
  },

  getMezonProfile: async (tokens: any) => {
    const accessToken = tokens.accessToken;
    const idToken = tokens.idToken;

    const response = await apiClient.get(`${process.env.MEZON_AUTH_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile: MezonProfile = response as any;

    const authRes = await apiClient.post<{ accessToken: string }>("/v1/auth/mezon-login", {
      id_token: idToken,
    });
    const authData = userService.handleResponse<{ accessToken: string }>(authRes);

    return {
      id: String(profile.mezon_id),
      name: profile.username || profile.display_name,
      email: profile.email,
      image: profile.avatar,
      emailVerified: true,
      accessToken: authData.accessToken,
    };
  },
}