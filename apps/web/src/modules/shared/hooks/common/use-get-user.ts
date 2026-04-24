"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-key";
import { useAuthStore } from "@/stores/login/auth-store";
import { getUserById } from "@/services/user/user-service";


export function useGetUser(userId: string | undefined) {
  const { user: currentUser, hasHydrated } = useAuthStore();
  
  return useQuery({
    queryKey: QUERY_KEYS.USERS.GET_BY_ID.getKey(userId || ""),
    queryFn: async () => {
      if (!userId || !currentUser?.accessToken) return null;
      return await getUserById(userId, currentUser.accessToken);
    },
    enabled: hasHydrated && !!userId && !!currentUser?.accessToken,
    staleTime: 1000 * 60 * 10, 
    retry: 1,
  });
}
