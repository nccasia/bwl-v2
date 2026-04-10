import { Post, Contributor, Channel, LeaderboardEntry } from "../../types/home-v2";


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockPosts: Post[] = [];


export const postService = {
  async createPost(content: string, user: { id: string; name: string; image?: string | null }): Promise<Post> {
    await delay(1200); 
    const newPost: Post = {
      id: Math.random().toString(36).substring(7),
      content,
      author: { ...user },
      stats: { likes: 0, comments: 0, shares: 0 },
      createdAt: new Date().toISOString(),
      images: []
    };
    mockPosts = [newPost, ...mockPosts];
    return newPost;
  },

  async getContributors(): Promise<Contributor[]> {
    await delay(800);
    return [];
  },

  async getTopChannels(): Promise<Channel[]> {
    await delay(600);
    return [];
  },

  async getChannels(): Promise<Channel[]> {
    await delay(700);
    return [];
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay(900);
    return [];
  },

  async reactToPost(_postId: string, _type: string | null): Promise<{ success: boolean }> {
    // Satisfy lint for unused variables in mock
    void _postId;
    void _type;
    await delay(500);
    return { success: true };
  },
};

