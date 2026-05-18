"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/login/auth-store";
import { getCurrentUserAction, getUserByIdAction } from "@/services/user/user-actions-service";
import { QUERY_KEYS } from "@/constants/query-key";
import { UserProfile } from "@/types/profile/profile";

export function useProfile(username: string) {
  const { user, hasHydrated } = useAuthStore();
  const isOwnProfile = hasHydrated ? user?.id === username : false;

  const {
    data: profile,
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.PROFILE.GET_BY_USERNAME, username],
    queryFn: async () => {
      if (!hasHydrated) return null;

      const result = isOwnProfile 
        ? await getCurrentUserAction(user?.accessToken || "")
        : await getUserByIdAction(username, user?.accessToken || "");
      
      if (!result?.isSuccess) {
        throw new Error("Failed to fetch profile");
      }
      
      return result.data as UserProfile;
    },
    enabled: hasHydrated && !!username,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    profile: profile ?? null,
    isLoading: !hasHydrated || isQueryLoading,
    isOwnProfile,
    isError,
    error: error instanceof Error ? error.message : String(error),
  };
}
