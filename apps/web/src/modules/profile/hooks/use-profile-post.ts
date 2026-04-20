import { QUERY_KEYS } from "@/constants/query-key";
import { getPostsAction, mapApiPostToUiPost } from "@/services/post";
import { useQuery } from "@tanstack/react-query";
import { Post as ApiPost } from "@/types/post";
import { useMemo } from "react";

export function useProfilePost(authorId: string) {
    const { data: posts, isLoading, isError, error } = useQuery({
        queryKey: QUERY_KEYS.PROFILE.POSTS.getKey({ authorId }),
        queryFn: async () => {
            const result = await getPostsAction(1, 100, { authorId });
            if (!result?.isSuccess || !result.data) {
                throw new Error("Failed to fetch posts");
            }

            
            const apiPosts = result.data as unknown as ApiPost[];
            return apiPosts.map(mapApiPostToUiPost);
        },
        enabled: !!authorId,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });

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
        }, 
        actions: {
            
        }
    };
}