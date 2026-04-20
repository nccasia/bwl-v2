import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-key";
import { CreateCommentInput } from "@/schemas/comments/comment-schema";
import { useToast } from "@/modules/shared/hooks/toast";
import { ApiResponse } from "@/types/shared";
import { Comment } from "@/types/comment/comment";
import { createCommentAction, getCommentRepliesAction, getCommentsByPostAction } from "@/services/comment";

export function usePostComments(postId: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.COMMENTS.GET_BY_POST.getKey(postId),
    queryFn: ({ pageParam = 1 }) => getCommentsByPostAction(postId, { page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ApiResponse<Comment[]>) => {
      const { currentPage, totalPage } = lastPage.pagination || {};
      if (typeof currentPage === 'number' && typeof totalPage === 'number' && currentPage < totalPage) {
        return currentPage + 1;
      }
      return undefined;
    },
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

