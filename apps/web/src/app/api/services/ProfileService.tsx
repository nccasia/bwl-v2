import { BE_URL, Post, Reactions } from "@/types/gallery";
import { DetailedStats, FetchPostsResponse } from "../../../components/profile/Profile.type";

export const fetchPosts = async (username: string, page: number, limit: number): Promise<FetchPostsResponse> => {
  try {
    const res = await fetch(
      `${BE_URL}/bwl?page=${page}&limit=${limit}&authorId=${encodeURIComponent(username)}`
    );
    if (!res.ok) throw new Error("Failed to fetch posts");

    return await res.json();
  } catch (err) {
    console.error("Fetch posts failed", err);
    throw err;
  }
};

export const fetchStats = async (username: string) => {
  try {
    const res = await fetch(
      `${BE_URL}/bwl/users/${encodeURIComponent(username)}/stats`
    );
    if (!res.ok) throw new Error("Failed to fetch stats");
    
    return await res.json();
  } catch (err) {
    console.error("Fetch stats failed", err);
    throw err;
  }
};

export const fetchDetailedStats = async (username: string): Promise<DetailedStats> => {
  try {
    const postsRes = await fetch(`${BE_URL}/bwl?limit=1000&authorId=${encodeURIComponent(username)}`);
    if (!postsRes.ok) throw new Error("Failed to fetch all user posts");
    
    const postsData = await postsRes.json();
    const allUserPosts: Post[] = postsData.data || [];

    if (allUserPosts.length === 0) {
      return { globalSum: 0, totalPosts: 0, reactionMap: {} };
    }

    const reactionPromises = allUserPosts.map(post => 
      fetch(`${BE_URL}/bwl/${post.id}/reactions`)
        .then(r => r.ok ? r.json() : {})
        .catch(() => ({}))
    );
    
    const allReactions: Reactions[] = await Promise.all(reactionPromises);

    let globalSum = 0;
    const reactionMap: Record<string, number> = {};

    allReactions.forEach((reactions, idx) => {
      let count = 0;
      Object.values(reactions).forEach(users => {
        count += Array.isArray(users) ? users.length : 0;
      });
      globalSum += count;
      reactionMap[allUserPosts[idx].id] = count;
    });

    return { globalSum, totalPosts: allUserPosts.length, reactionMap };
  } catch (err) {
    console.error("Failed detailed stats fetch:", err);
    throw err;
  }
};

export const reactToPost = async (postId: string, username: string, emoji: string): Promise<Reactions> => {
  try {
    const res = await fetch(`${BE_URL}/bwl/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: username, emoji }),
    });
    if (!res.ok) throw new Error("Failed to react to post");
    
    return await res.json();
  } catch (err) {
    console.error("Failed to react:", err);
    throw err;
  }
};