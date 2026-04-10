import "server-only";
import { apiClient } from "@/libs/api-client";
import { Post } from "@/types/post";

export const postService = {
  getPosts: async (page: number, limit: number = 10) => {
    const param = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      "sort[createdAt]": "desc",
    });
    const response = await apiClient.get<Post[]>(
      `/v1/posts/get-posts?${param}`,
    );
    return response;
  },
};
