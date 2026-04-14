import type { Post as ApiPost } from "@/types/post/post";
import type { Post as UiPost } from "@/types/home-v2";

export function mapApiPostToUiPost(apiPost: ApiPost): UiPost {
  const reactions = apiPost.reactions || {};
  const likesCount = Object.values(reactions).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  ); 
  return {
    id: apiPost.id,
    channelId: apiPost.channelId,
    content: apiPost.content,
    createdAt: apiPost.createdAt,
    author: {
      id: apiPost.author.id,
      username: apiPost.author.userName,
      avatar: apiPost.author.avatar,
    },
    images: apiPost.images || [],
    stats: {
      likes: likesCount,
      comments: 0,
      shares: 0,
    },
  };
}