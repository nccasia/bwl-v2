import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/login/auth-store";
import { useMemo } from "react";
import { useHomeStore } from "@/stores/home/home-store";
import { QUERY_KEYS } from "@/constants/query-key";
import { getChannels, getPosts } from "@/services/home-v2";

export function useHomeFeed() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const selectedChannelId = useHomeStore((state) => state.selectedChannelId);

  const { data: apiChannels = [] } = useQuery({
    queryKey: QUERY_KEYS.HOME_V2.CHANNELS.getKey(),
    queryFn: () => getChannels(1, 100),
  });

  const idResolver = useMemo(() => {
    const resolver = new Map<string, string>();
    if (Array.isArray(apiChannels)) {
      apiChannels.forEach((e) => {
        resolver.set(e.id, e.id);
        if (e.mezonChannelId) {
          resolver.set(e.mezonChannelId, e.id);
        }
      });
    }
    return resolver;
  }, [apiChannels]);

  const { data: postsData = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: QUERY_KEYS.HOME_V2.POSTS.getKey(),
    queryFn: () => getPosts(1, 50),
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
  });

  const posts = useMemo(() => {
    if (!selectedChannelId) return postsData;
    
    return postsData.filter(post => {
      const rawPostChannel = post.channelId || "web";
      const normalizedPostChannel = idResolver.get(rawPostChannel) || rawPostChannel;
      return normalizedPostChannel === selectedChannelId;
    });
  }, [postsData, selectedChannelId, idResolver]);

  const isFiltering = useHomeStore((state) => state.isFiltering);

  return {
    state:{
        isAuthenticated,
        posts,
        isLoadingPosts,
        isFiltering,
        selectedChannelId,
    },
  };
}

