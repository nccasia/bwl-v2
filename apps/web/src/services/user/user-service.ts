import { apiClient } from "@/libs/api-client"


export interface MezonProfile {
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  isFirstLogin: boolean;
  role: string;
}

export const userService = {
  getMezonProfile: async (tokens: { accessToken: string; id_token: string ; idToken?: string }) => {
    const idToken = tokens.idToken;
    const authRes = await apiClient.post<{ accessToken: string }>(
      "/v1/auth/mezon-login",
      { id_token: idToken }
    );

    const accessToken = authRes.data?.accessToken;

    const profileRes = await apiClient.get<MezonProfile>("/v1/account/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      id: String(profileRes.data?.id),
      name: profileRes.data?.userName || "",
      email: profileRes.data?.email || "",
      image: profileRes.data?.avatar || "",
      emailVerified: true,
      accessToken: accessToken,
    };
  },
}