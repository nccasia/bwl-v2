import { Channel, LeaderboardEntry, Post, Author } from "@/types/home-v2";
import { Post as ApiPost } from "@/types/post/post";
import { mapApiPostToUiPost } from "@/services/post/post-mapper";
import { getChannelsAction } from "../channels/channel-actions-service";
import { getPostsAction } from "../post/post-actions-service";

export async function getChannelsWithCounts(): Promise<Channel[]> {
  const [channelResponse, postResponse] = await Promise.all([
    getChannelsAction(1, 100),
    getPostsAction(1, 50),
  ]);

  const apiChannels = (channelResponse.data as Channel[]) || [];
  const posts = ((postResponse.data as unknown) as { data: ApiPost[] })?.data || 
                (Array.isArray(postResponse.data) ? (postResponse.data as ApiPost[]) : []);

  const channelDataMap = new Map<string, Channel & { postCount: number }>();
  const idResolver = new Map<string, string>();

  apiChannels.forEach((ch) => {
    channelDataMap.set(ch.id, { ...ch, postCount: 0 });
    idResolver.set(ch.id, ch.id);
    if (ch.mezonChannelId) idResolver.set(ch.mezonChannelId, ch.id);
  });

  posts.forEach((post: ApiPost) => {
    const rawId = post.channelId && post.channelId !== "null" ? post.channelId : "web";
    const primaryId = idResolver.get(rawId) || rawId;

    if (!channelDataMap.has(primaryId)) {
      channelDataMap.set(primaryId, {
        id: primaryId,
        name: rawId === "web" ? "web" : "",
        postCount: 0,
        mezonChannelId: "",
      });
    }

    channelDataMap.get(primaryId)!.postCount++;
  });

  return Array.from(channelDataMap.values()).sort((a, b) => b.postCount - a.postCount);
}


export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await getPostsAction(1, 100);
  const posts = ((response.data as unknown) as { data: ApiPost[] })?.data || 
                (Array.isArray(response.data) ? (response.data as ApiPost[]) : []);

  if (!Array.isArray(posts)) return [];

  const userStatsMap = new Map<string, { user: Author; postCount: number }>();

  posts.forEach((post: ApiPost) => {
    const author = post.author;
    if (!author || !author.id) return;

    const stats = userStatsMap.get(author.id) || { 
      user: {
        id: author.id,
        username: author.userName,
        displayName: author.displayName,
        avatar: author.avatar
      }, 
      postCount: 0 
    };
    
    stats.postCount++;
    userStatsMap.set(author.id, stats);
  });

  return Array.from(userStatsMap.values())
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10)
    .map((entry, index) => ({
      id: entry.user.id,
      user: entry.user,
      postCount: entry.postCount,
      rank: index + 1
    }));
}

export async function getPosts(page: number = 1, limit: number = 50): Promise<Post[]> {
  const response = await getPostsAction(page, limit);
  const postData = ((response.data as unknown) as { data: ApiPost[] })?.data || 
                   (Array.isArray(response.data) ? (response.data as ApiPost[]) : []);

  if (response.isSuccess && Array.isArray(postData)) {
    return postData.map(mapApiPostToUiPost);
  }
  return [];
}

export async function getChannels(page: number = 1, limit: number = 100): Promise<Channel[]> {
  const response = await getChannelsAction(page, limit);
  return (response.data as Channel[]) || [];
}
