import { Post, Reactions } from "@/types/gallery";

export const LIMIT = 18;

export interface Stats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
}

export interface DetailedStats {
  globalSum: number;
  totalPosts: number;
  reactionMap: Record<string, number>;
}

export interface FetchPostsResponse {
  data: Post[];
  total: number;
}
