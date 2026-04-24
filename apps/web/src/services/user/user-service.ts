import { apiClient } from "@/libs/api-client";
import { MezonProfile } from "@/types/user/user";


const mapToUser = (data: Partial<MezonProfile>) => {
  const userName = data.userName || "";
  const displayName = data.displayName || userName;

  return {
    id: String(data.id ?? ""),
    userId: String(data.id ?? ""),
    userName: userName,
    username: userName,
    name: displayName,
    displayName: displayName,
    email: data.email ?? "",
    image: data.avatar,
    avatar: data.avatar,
    emailVerified: true,
  };
};

export async function  getMezonProfile(idToken: string) {
  const authRes = await apiClient.post<{ accessToken: string }>(
    "/v1/auth/mezon-login",
    { id_token: idToken }
  );

  const accessToken = authRes.data?.accessToken;
  if (!accessToken) throw new Error("Could not obtain access token from Mezon");

  const profileRes = await apiClient.get<MezonProfile>("/v1/account/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.data) throw new Error("Mezon profile data is empty");

  const mappedUser = mapToUser(profileRes.data);

  return {
    ...mappedUser,
    accessToken, 
  };
}

export async function getUserById(userId: string, accessToken: string) {

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5100";
  const res = await fetch(`${API_BASE_URL}/v1/users/get-user/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("User not found");

  const json = await res.json();
  const rawData: MezonProfile = json?.data?.data ?? json?.data ?? json;

  if (!rawData) throw new Error("User not found");
  return mapToUser(rawData);
}

export async function getCurrentUser(accessToken: string) {
  try {
    const response = await apiClient.get<MezonProfile>("/v1/account/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      ...response,
      data: response.data ? mapToUser(response.data) : null,
    };
  } catch (error) {
    console.error("GetCurrentUser Error:", error);
    return { data: null, error };
  }
}