import { useTranslations } from "next-intl";
import { usePostComments } from "./use-comments";

export function useCommentsSection(postId: string) {
    const t = useTranslations("home");
      const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        usePostComments(postId);
    
      const comments =
        data?.pages.flatMap((page) => (page.data as any) || []) || [];   

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