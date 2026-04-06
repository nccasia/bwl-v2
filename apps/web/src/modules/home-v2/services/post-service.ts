import { Post, Contributor, Channel, LeaderboardEntry } from "../types";


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockPosts: Post[] = [];


export const postService = {
  async getPosts(): Promise<Post[]> {
    await delay(1000); 
    return [...mockPosts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async createPost(content: string, user: { id: string; name: string; image?: string | null }): Promise<Post> {
    await delay(1200); 
    const newPost: Post = {
      id: Math.random().toString(36).substring(7),
      content,
      author: { ...user },
      stats: { likes: 0, comments: 0, shares: 0 },
      createdAt: new Date().toISOString(),
      media: null,
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
};

