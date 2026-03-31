import { BE_URL, Channel, Post } from "@/types/gallery";

export interface FetchPostsResponse {
  data: Post[];
  total: number;
}

export type Period = "7d" | "30d" | "1y";

export interface TopAuthor {
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  postCount: number;
}

export const fetchTopAuthors = async (period: string = "30d", limit: number = 5): Promise<TopAuthor[]> => {
  try {
    const res = await fetch(`${BE_URL}/bwl/stats/top-authors?period=${period}`);
    if (res.ok) {
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json.data || []);
      return data.map((item: any) => ({
        username: item.username || item.id,
        displayName: item.display_name || item.displayName || item.username,
        avatar: item.avatar,
        postCount: item.postCount || item.count || 0
      })).slice(0, limit);
    }
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      // Gracefully handle backend being offline
    } else {
      console.error("API error:", e);
    }
  }

  try {
    const fetchLimit = period === "7d" ? 50 : period === "30d" ? 150 : 300;
    const pRes = await fetch(`${BE_URL}/bwl?limit=${fetchLimit}`);
    if (pRes.ok) {
      const json = await pRes.json();
      const posts: any[] = json.data || [];
      const counts: Record<string, { count: number; avatar: string | null; displayName: string }> = {};

      posts.forEach(p => {
        if (!p.authorId) return;
        if (!counts[p.authorId]) {
          counts[p.authorId] = { 
            count: 0, 
            avatar: p.authorAvatar || null,
            displayName: p.display_name || p.authorDisplayName || p.authorName || p.authorId
          };
        }
        counts[p.authorId].count++;
      });

      return Object.entries(counts)
        .map(([username, data]) => ({
          username,
          displayName: data.displayName,
          avatar: data.avatar,
          postCount: data.count
        }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, limit);
    }
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      // Gracefully handle backend being offline
    } else {
      console.error("API error:", e);
    }
  }

  return [];
};

export const fetchTopChannels = async (limit: number = 5): Promise<Channel[]> => {
  try {
    const res = await fetch(`${BE_URL}/bwl/channels`);
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
      return list.sort((a: Channel, b: Channel) => b.count - a.count).slice(0, limit);
    }
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      // Gracefully handle backend being offline
    } else {
      console.error("API error:", e);
    }
  }
  return [];
};

export const fetchPosts = async (page: number, limit: number, channelId?: string | null): Promise<FetchPostsResponse> => {
  try {
    const params = new URLSearchParams({ 
      page: String(page), 
      limit: String(limit) 
    });
    if (channelId) params.set("channelId", channelId);

    const res = await fetch(`${BE_URL}/bwl?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return await res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      // Gracefully handle backend being offline
      return { data: [], total: 0 };
    }
    console.error("Fetch posts failed:", err);
    return { data: [], total: 0 };
  }
};
