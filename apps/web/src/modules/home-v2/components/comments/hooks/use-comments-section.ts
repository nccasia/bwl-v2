import { useTranslations } from "next-intl";
import { Comment } from "@/types/comment/comment";
import { usePostComments } from "./use-comments";

export function useCommentsSection(postId: string) {
    const t = useTranslations("home");
      const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        usePostComments(postId);
    
      const comments: Comment[] =
        data?.pages.flatMap((page) => (page.data as Comment[]) || []) || [];

      return {
        state: {
            t,
            data,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            comments,
        },
        handlers: {
            fetchNextPage,
        },
      };
}