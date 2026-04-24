import { useTranslations } from "next-intl";
import { Comment } from "@/types/comment/comment";
import { usePostComments } from "./use-comments";
import { useCallback } from "react";
import { useInView } from "@/modules/shared/hooks/common/use-in-view";
import { useCommentStore } from "../stores/comment-store";

export function useCommentsSection(postId: string) {
    const t = useTranslations("home");
    const { recordFetchResult, getStableHasNextPage } = useCommentStore();
    
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        usePostComments(postId);
    
    const allComments = data?.pages.flatMap((page) => (page.data as Comment[]) || []) || [];
    const uniqueComments = Array.from(new Map(allComments.map(c => [c.id, c])).values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stableHasNextPage = getStableHasNextPage(postId);

    const handleFetchNextPage = useCallback(() => {
        if (!isFetchingNextPage && hasNextPage && stableHasNextPage) {
            recordFetchResult(postId, uniqueComments.length);
            
            if (getStableHasNextPage(postId)) {
                fetchNextPage();
            }
        }
    }, [
        postId, 
        isFetchingNextPage, 
        hasNextPage, 
        stableHasNextPage, 
        uniqueComments.length, 
        recordFetchResult, 
        getStableHasNextPage, 
        fetchNextPage
    ]);

    const { ref } = useInView({ 
        rootMargin: "500px",
        onInView: handleFetchNextPage 
    });

    return {
        state: {
            t,
            hasNextPage: hasNextPage && stableHasNextPage,
            isFetchingNextPage,
            isLoading,
            comments: uniqueComments,
            infiniteScrollRef: ref,
        },
        handlers: {
            fetchNextPage: handleFetchNextPage,
        },
    };
}
