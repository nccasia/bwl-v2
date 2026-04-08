import { useQuery } from "@tanstack/react-query";
import { postService } from "../../../services/post/post-service";

export function useHomeFeed() {
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => postService.getPosts(),
  });

  const { data: contributors = [], isLoading: isLoadingContributors } = useQuery({
    queryKey: ["contributors"],
    queryFn: () => postService.getContributors(),
  });

  return {
    posts,
    isLoadingPosts,
    contributors,
    isLoadingContributors,
  };
}
