import { apiClient } from "@/libs/api-client"
import { MezonProfile, UserProfile } from "@/types/user/user";

const mapProfile = (data: MezonProfile): UserProfile => ({
  id: String(data.id),
  username: data.userName,
  email: data.email || "",
  avatar: data.avatar,
  isFirstLogin: data.isFirstLogin,
  role: data.role,
});

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
      name: profile.username,
      email: profile.email,
      image: profile.avatar,
      emailVerified: true,
      accessToken: accessToken,
    };
  },

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
