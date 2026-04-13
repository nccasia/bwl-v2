import { getChannelsAction } from "@/actions/channel-actions";
import { getPostsAction } from "@/actions/post-actions";
import { Channel, LeaderboardEntry, Post, Contributor, Author } from "@/types/home-v2";
import { mapApiPostToUiPost } from "@/services/post/posts-service/post-mapper";
import { postService as basePostService } from "@/services/post/post-service";

export const homeService = {
  async getChannelsWithCounts(): Promise<Channel[]> {
    const [channelResponse, postResponse] = await Promise.all([
      getChannelsAction(1, 100),
      getPostsAction(1, 50),
    ]);

    const apiChannels = (channelResponse.data as Channel[]) || [];
    const posts = (postResponse.data as any)?.data || 
                  (Array.isArray(postResponse.data) ? postResponse.data : []);

    const channelDataMap = new Map<string, Channel & { postCount: number }>();
    const idResolver = new Map<string, string>();

    apiChannels.forEach((ch) => {
      channelDataMap.set(ch.id, { ...ch, postCount: 0 });
      idResolver.set(ch.id, ch.id);
      if (ch.mezonChannelId) idResolver.set(ch.mezonChannelId, ch.id);
    });

    posts.forEach((post: any) => {
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
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await getPostsAction(1, 100);
    const posts = (response.data as any)?.data || 
                  (Array.isArray(response.data) ? response.data : []);

    if (!Array.isArray(posts)) return [];

    const userStatsMap = new Map<string, { user: Author; postCount: number }>();

    posts.forEach((post: Post) => {
      const author = post.author;
      if (!author || !author.id) return;

      const stats = userStatsMap.get(author.id) || { 
        user: {
          id: author.id,
          username: author.username,
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
  },

  async getPosts(page: number = 1, limit: number = 50): Promise<Post[]> {
    const response = await getPostsAction(page, limit);
    const postData = (response.data as any)?.data || 
                     (Array.isArray(response.data) ? response.data : []);

    if (response.isSuccess && Array.isArray(postData)) {
      return postData.map(mapApiPostToUiPost);
    }
    return [];
  },

  async getChannels(page: number = 1, limit: number = 100): Promise<Channel[]> {
    const response = await getChannelsAction(page, limit);
    return (response.data as Channel[]) || [];
  },

  async getContributors(): Promise<Contributor[]> {
    return basePostService.getContributors();
  },
};