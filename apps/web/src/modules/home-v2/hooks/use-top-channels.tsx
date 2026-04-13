import { useQuery } from "@tanstack/react-query";
import { homeService } from "../../../services/hom-v2/home-service";
import { QUERY_KEYS } from "@/constants/query-key";
import { useHomeStore } from "@/stores/home/home-store";

export function useTopChannels() {
  const { selectedChannelId, setSelectedChannelId } = useHomeStore();
  const { data: channels = [], isLoading: isLoadingChannels } = useQuery({
    queryKey: QUERY_KEYS.HOME_V2.CHANNELS_WITH_COUNTS.getKey(),
    queryFn: () => homeService.getChannelsWithCounts(),
    refetchInterval: 10 * 1000,
  });

  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: QUERY_KEYS.HOME_V2.LEADERBOARD.getKey(),
    queryFn: () => homeService.getLeaderboard(),
    refetchInterval: 10 * 1000,
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
