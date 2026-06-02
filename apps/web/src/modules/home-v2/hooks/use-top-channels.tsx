import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-key";
import { useHomeStore } from "@/stores/home/home-store";
import { getChannelsWithCounts, getLeaderboard } from "@/services/home-v2";

export function useTopChannels() {
  const { selectedChannelId, setSelectedChannelId } = useHomeStore();
  const { data: channels = [], isLoading: isLoadingChannels } = useQuery({
    queryKey: QUERY_KEYS.HOME_V2.CHANNELS_WITH_COUNTS.getKey(),
    queryFn: () => getChannelsWithCounts(),
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  });

  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: QUERY_KEYS.HOME_V2.LEADERBOARD.getKey(),
    queryFn: () => getLeaderboard(),
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  });

  return {
    state: {
      selectedChannelId,
      setSelectedChannelId,
      channels,
      topChannels: channels,
      isLoadingChannels,
      isLoadingTop: isLoadingChannels,
      leaderboard,
      isLoadingLeaderboard,
    },
  };
}
