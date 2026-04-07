import { AUTH_URL } from "@/constants/api";
import { apiClient } from "@/libs/api-client"


export interface MezonProfile {
  username?: string;
  display_name?: string;
  email?: string;
  avatar?: string;
  mezon_id: string | number;
}

export const userService = {
  getMezonProfile: async (tokens: { accessToken: string; idToken: string }) => {
    const { accessToken, idToken } = tokens;
    const profileRes = await apiClient.get<MezonProfile>("/userinfo", {
      baseURL: AUTH_URL,
      url: "/userinfo", 
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const authRes = await apiClient.post<{ accessToken: string }>(
      "/v1/auth/mezon-login",
      { id_token: idToken },
      { url: "/v1/auth/mezon-login" } 
    );
    
    const data = profileRes as unknown as MezonProfile;
    
    return {
      id: String(data?.mezon_id || ""), 
      name: data?.username || "",
      email: data?.email || "",
      image: data?.avatar || "",
      emailVerified: true,
      accessToken: authRes.data?.accessToken || "",
    };
  },
}