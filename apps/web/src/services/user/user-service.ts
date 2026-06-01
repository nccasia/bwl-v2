import { apiClient } from "@/libs/api-client";
import { MezonProfile } from "@/types/user/user";

const mapToUser = (data: Partial<MezonProfile>, accessToken: string) => {
  const userName = data.userName || "";
  const displayName = data.displayName || userName;

  return {
    userId: String(data.id ?? ""),
    username: userName,
    userName,
    name: displayName,
    email: data.email ?? "",
    image: data.avatar,
    avatar: data.avatar,
    emailVerified: true as const,
    accessToken,
  };
};

export async function getMezonProfile(idToken: string) {
  const authResponse = await apiClient.post<{ accessToken?: string }>(
    "/v1/auth/mezon-login",
    { id_token: idToken },
  );

  if (!authResponse.isSuccess) {
    throw new Error(
      `Mezon login failed (${authResponse.statusCode}): ${authResponse.message ?? "Unknown error"}`,
    );
  }

  const accessToken = authResponse.data?.accessToken;

  if (!accessToken) {
    throw new Error("Could not obtain access token from backend");
  }

  const profileResponse = await apiClient.get<MezonProfile>("/v1/account/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.isSuccess || !profileResponse.data) {
    throw new Error(
      `Failed to fetch profile (${profileResponse.statusCode}): ${profileResponse.message ?? "Unknown error"}`,
    );
  }

  return mapToUser(profileResponse.data, accessToken);
}

export async function getUserById(userId: string, accessToken: string) {
  const response = await apiClient.get<MezonProfile>(
    `/v1/users/get-user/${userId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.isSuccess || !response.data) {
    throw new Error("User not found");
  }

  return mapToUser(response.data, accessToken);
}

export async function getCurrentUser(accessToken: string) {
  try {
    const response = await apiClient.get<MezonProfile>("/v1/account/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      ...response,
      data: response.data ? mapToUser(response.data, accessToken) : null,
    };
  } catch (error) {
    console.error("GetCurrentUser Error:", error);
    return { data: null, error };
  }
}
