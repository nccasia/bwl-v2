import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-key";
import { CreateCommentInput } from "@/schemas/comments/comment-schema";
import { useToast } from "@/modules/shared/hooks/toast";
import { ApiResponse } from "@/types/shared";
import { Comment } from "@/types/comment/comment";
import { createCommentAction, getCommentRepliesAction, getCommentsByPostAction } from "@/services/comment";

export function usePostComments(postId: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.COMMENTS.GET_BY_POST.getKey(postId),
    queryFn: ({ pageParam }) => 
      getCommentsByPostAction(postId, { 
        nextCursor: pageParam as string,
        sort: { id: 'desc' } 
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ApiResponse<Comment[]>) => {
      if (!lastPage.data || lastPage.data.length <= 1) {
        return undefined;
      }
      return lastPage.pagination?.nextCursor;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useCommentReplies(commentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COMMENTS.GET_REPLIES.getKey(commentId),
    queryFn: () => getCommentRepliesAction(commentId),
    enabled: !!commentId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateCommentInput) => createCommentAction(data),
    onSuccess: (response) => {
      const comment = response.data;
      if (!comment) return;

      if (comment.parentId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS.GET_REPLIES.getKey(comment.parentId) });
      } else {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS.GET_BY_POST.getKey(comment.postId) });
      }
    },
    onError: (e: Error) => {
      toast.error(e?.message);
    },
  });
}

