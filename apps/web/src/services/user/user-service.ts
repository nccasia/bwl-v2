import type { User } from "@/schemas/login/auth-schema"
import { apiClient } from "@/libs/api-client"
import type { ApiResponse } from "@/types/shared"
import { AUTH_URL } from "@/constants/api";

export interface MezonProfile {
  username?: string;
  display_name?: string;
  email?: string;
  avatar?: string;
  mezon_id: string | number;
}

export const userService = {
  handleResponse: <T>(response: ApiResponse<T>): T => {
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

  getMezonProfile: async (tokens: { accessToken: string; idToken: string }) => {
    const accessToken = tokens.accessToken;
    const idToken = tokens.idToken;

    const response = await apiClient.get<MezonProfile>(`${AUTH_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = userService.handleResponse<MezonProfile>(response);

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