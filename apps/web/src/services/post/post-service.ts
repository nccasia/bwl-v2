import { Post } from "../../types/home-v2";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createPost(content: string, user: { id: string; username: string; avatar?: string }): Promise<Post> {
  await delay(1200);
  const newPost: Post = {
    id: Math.random().toString(36).substring(7),
    content,
    author: { ...user },
    stats: { likes: 0, comments: 0, shares: 0 },
    createdAt: new Date().toISOString(),
    images: []
  };
  return newPost;
} 



