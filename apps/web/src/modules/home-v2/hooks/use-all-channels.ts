import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-key";
import { useHomeStore } from "@/stores/home/home-store";
import { getChannelsWithCounts } from "@/services/home-v2";

export function useAllChannels() {
  const { selectedChannelId, setSelectedChannelId } = useHomeStore();

  const { data: channels = [], isLoading: isLoadingChannels } = useQuery({
    queryKey: QUERY_KEYS.HOME_V2.CHANNELS_WITH_COUNTS.getKey(),
    queryFn: () => getChannelsWithCounts(),
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  });

  return {
    state: {
      selectedChannelId,
      setSelectedChannelId,
      channels,
      isLoadingChannels,
    },
  };
}
