import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeTargetAction, unlikeTargetAction } from "@/services/reaction";
import { ReactionTargetType, Reaction } from "@/types/reaction";
import { useAuthStore } from "@/stores/login/auth-store";
import { useLoginRequiredStore } from "@/stores/shared/login-required-store";
import { QUERY_KEYS } from "@/constants/query-key";
import { isSameId } from "../../utils/id-utils";

export function useReaction() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const openLoginRequired = useLoginRequiredStore((state) => state.open);

  const toggleReactionMutation = useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      isLiked,
    }: {
      targetId: string;
      targetType: ReactionTargetType;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        return unlikeTargetAction(targetType, targetId);
      } else {
        return likeTargetAction({ targetId, targetType });
      }
    },
    onMutate: async (variables) => {
      const queryKey = ["reactions", variables.targetType, variables.targetId];
      await queryClient.cancelQueries({ queryKey });
      
      const previousReactions = queryClient.getQueryData<Reaction[]>(queryKey);
      
      const currentUserId = useAuthStore.getState().user?.id;
      
      if (variables.isLiked) {
        queryClient.setQueryData<Reaction[]>(queryKey, (old) => 
          (old || []).filter(r => !isSameId(r.userId, currentUserId))
        );
      } else {
        const newReaction: Reaction = {
           id: "temp-id-" + Date.now(),
           userId: currentUserId || "",
           targetId: variables.targetId,
           targetType: variables.targetType,
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Reaction[]>(queryKey, (old) => [...(old || []), newReaction]);
      }
      
      return { previousReactions };
    },
    onError: (e, variables, context: any) => {
      const queryKey = ["reactions", variables.targetType, variables.targetId];
      if (context && context.previousReactions !== undefined) {
        queryClient.setQueryData(queryKey, context.previousReactions);
      } else {
        queryClient.setQueryData(queryKey, []);
      }
      console.error(e);
    },
    onSettled: (_, __, variables) => {
      const queryKey = ["reactions", variables.targetType, variables.targetId];
      queryClient.invalidateQueries({ queryKey });
      
      if (variables.targetType === ReactionTargetType.Post) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HOME_V2.POSTS.getKey() });
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      }
    },
  });

  const handleToggleReaction = async (
    targetId: string,
    targetType: ReactionTargetType,
    isLiked: boolean
  ) => {
    if (!isAuthenticated) {
      openLoginRequired();
      return;
    }

    await toggleReactionMutation.mutateAsync({ targetId, targetType, isLiked });
  };

  return {
    handleToggleReaction,
    isLoading: toggleReactionMutation.isPending,
  };
}
