import { apiClient } from "@/libs/api-client"
import { User } from "@/schemas/login";

export interface MezonProfile {
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  isFirstLogin: boolean;
  role: string;
}

const mapProfile = (data: MezonProfile): User => ({
  id: String(data.id),
  userName: data.userName,
  email: data.email || "",
  avatar: data.avatar,
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5100';

export const userService = {
  getMezonProfile: async (tokens: { accessToken: string; idToken?: string }) => {
    const idToken = tokens.idToken;
    const authRes = await apiClient.post<{ accessToken: string }>(
      "/v1/auth/mezon-login",
      { id_token: idToken }
    );

    const accessToken = authRes.data?.accessToken;

    const profileRes = await apiClient.get<MezonProfile>("/v1/account/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.data) throw new Error("Failed to fetch Mezon profile");
    const profile = mapProfile(profileRes.data);

    return {
      id: profile.id,
      name: profile.userName,
      email: profile.email,
      image: profile.avatar,
      emailVerified: true,
      accessToken: accessToken,
      userId: profile.id,
    };
  },

  getUserById: async (userId: string, accessToken: string): Promise<User> => {
    if (typeof window !== 'undefined') {
      const axios = (await import('axios')).default;
      const response = await axios.get<ApiResponse<MezonProfile>>(`${API_BASE_URL}/v1/users/get-user/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.data?.data) throw new Error("User not found");
      return mapProfile(response.data.data);
    }

    const response = await apiClient.get<MezonProfile>(`/v1/users/get-user/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.data) throw new Error("User not found");
    return mapProfile(response.data);
  },
};

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  statusCode: number;
}

export async function getCurrentUser(accessToken: string) {
  const response = await apiClient.get<MezonProfile>("/v1/account/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return {
    ...response,
    data: response.data ? mapProfile(response.data) : null,
  };
}

