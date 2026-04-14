import { useQuery } from "@tanstack/react-query";
import { postService } from "../../../services/post/post-service";
import { getPostsAction } from "@/services/post/post-actions-service";
import type { Post as ApiPost } from "@/types/post/post";
import type { Post as UiPost } from "@/types/home-v2";
import { useAuthStore } from "@/stores/login/auth-store";

function mapApiPostToUiPost(apiPost: ApiPost): UiPost {
  const reactions = apiPost.reactions || {};
  const likesCount = Object.values(reactions).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  ); 
  return {
    id: apiPost.id,
    content: apiPost.content,
    createdAt: apiPost.createdAt,
    author: {
      id: apiPost.author.id,
      name: apiPost.author.displayName || apiPost.author.userName,
      image: apiPost.author.avatar,
    },
    images: apiPost.images || [],
    stats: {
      likes: likesCount,
      comments: 0,
      shares: 0,
    },
  };
}

export function useHomeFeed() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await getPostsAction(1, 20); 
      if (response.isSuccess && Array.isArray(response.data)) {
        return response.data.map(mapApiPostToUiPost);
      }
      return [];
    },
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: contributors = [], isLoading: isLoadingContributors } = useQuery({
    queryKey: ["contributors"],
    queryFn: () => postService.getContributors(),
  });

  return {
    state:{
        isAuthenticated,
        posts,
        isLoadingPosts,
        contributors,
        isLoadingContributors,
    },
  };
}
