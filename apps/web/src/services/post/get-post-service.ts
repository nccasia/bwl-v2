
import { apiClient } from "@/libs/api-client";
import { Post } from "@/types/post";

import { LeaderboardEntry } from "@/types/home-v2";

export async function getPosts(page: number, limit: number = 10) {
  const param = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      "sort[createdAt]": "desc",
    });
    const response = await apiClient.get<Post[]>(
      `/v1/posts/get-posts?${param}`,
    );
    return response;
}

export async function getLeaderboard() {
  const response = await apiClient.get<LeaderboardEntry[]>(
      "/v1/posts/leaderboard",
    );
    return response;
}
