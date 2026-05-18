import { QUERY_KEYS } from "@/constants/query-key";
import { getPostsAction, mapApiPostToUiPost } from "@/services/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Post as ApiPost } from "@/types/post";
import { useEffect, useMemo } from "react";
import { ApiResponse } from "@/types/shared";
import { useProfilePostStore } from "../../../stores/post/profile-post-store";

export function useProfilePost(authorId: string) {
    const filters = useProfilePostStore((state) => state.filters);
    const setSearchQuery = useProfilePostStore((state) => state.setSearchQuery);
    const setSort = useProfilePostStore((state) => state.setSort);
    const resetFilters = useProfilePostStore((state) => state.resetFilters);

    useEffect(() => {
        if (authorId) {
            resetFilters(authorId);
        }
    }, [authorId, resetFilters]);

    const { 
        data, 
        isLoading, 
        isError, 
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: QUERY_KEYS.PROFILE.POSTS.getKey({ ...filters, authorId }),
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getPostsAction(pageParam as number, 4, { 
                authorId,
                search: filters.searchQuery,
                sortBy: filters.sortBy,
                sortDir: filters.sortDir
            });
            if (!result?.isSuccess || !result.data) {
                throw new Error("Failed to fetch posts");
            }
            return result as ApiResponse<ApiPost[]>;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPage } = lastPage.pagination || {};
            if (typeof currentPage === 'number' && typeof totalPage === 'number' && currentPage < totalPage) {
                return currentPage + 1;
            }
            return undefined;
        },
        enabled: !!authorId,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });

    const posts = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => {
            const apiPosts = page.data as unknown as ApiPost[];
            return (apiPosts || []).map(mapApiPostToUiPost);
        });
    }, [data?.pages]);

    const allImages = useMemo(() => {
        if (!posts) return [];
        const images = posts.flatMap((post) => post.images || []);
        return Array.from(new Set(images));
    }, [posts]);

    const hasPosts = posts && posts.length > 0;

    return { 
        state: {
            posts, 
            isLoading, 
            isError, 
            error, 
            allImages, 
            hasPosts,
            hasNextPage,
            isFetchingNextPage,
            filters,
        }, 
        actions: {
            fetchNextPage,
            setSearchQuery,
            setSort,
        }
    };
}

