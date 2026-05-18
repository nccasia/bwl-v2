import { useQuery } from "@tanstack/react-query";
import { getReactionsByTargetAction } from "@/services/reaction";
import { ReactionTargetType } from "@/types/reaction";

export function useTargetReactions(targetId: string, targetType: ReactionTargetType, enabled: boolean = true) {
  const query = useQuery({
    queryKey: ["reactions", targetType, targetId],
    queryFn: async () => {
      const response = await getReactionsByTargetAction(targetType, targetId);
      if (!response.isSuccess) {
        throw new Error("Failed to fetch reactions");
      }
      return response.data || [];
    },
    staleTime: 10000,
    enabled,
  });

  return {
    reactions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
