import { useQuery } from "@tanstack/react-query";
import { postService } from "../../../services/post/post-service";

export function useTopChannels() {
  const { data: topChannels = [], isLoading: isLoadingTop } = useQuery({
    queryKey: ["top-channels"],
    queryFn: () => postService.getTopChannels(),
  });

  const { data: channels = [], isLoading: isLoadingChannels } = useQuery({
    queryKey: ["channels"],
    queryFn: () => postService.getChannels(),
  });

  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => postService.getLeaderboard(),
  });

  return {
    state: {
      topChannels,
      isLoadingTop,
      channels,
      isLoadingChannels,
      leaderboard,
      isLoadingLeaderboard,
    },
  };
}
