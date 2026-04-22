
import { apiClient } from "@/libs/api-client";
import { Post } from "@/types/post";

import { LeaderboardEntry } from "@/types/home-v2";

export async function getPosts(
  page: number, 
  limit: number = 10, 
  params?: { 
    authorId?: string; 
    search?: string; 
    sortBy?: string; 
    sortDir?: "asc" | "desc" 
  }
) {
  const param = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const sortBy = params?.sortBy || "createdAt";
  const sortDir = params?.sortDir || "desc";
  param.append(`sort[${sortBy}]`, sortDir);

  if (params?.authorId) {
    param.append("filters[authorId][eq]", params.authorId);
  }

  if (params?.search) {
    param.append("search", params.search);
  }

  const response = await apiClient.get<Post[]>(`/v1/posts/get-posts?${param}`);
  return response;
}

export async function getLeaderboard() {
  const response = await apiClient.get<LeaderboardEntry[]>(
      "/v1/posts/leaderboard",
    );
    return response;
}
