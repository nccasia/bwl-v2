import type { Post as ApiPost } from "@/types/post/post";
import type { Post as UiPost } from "@/types/home-v2";

export function mapApiPostToUiPost(apiPost: ApiPost): UiPost {
  const reactions = apiPost.reactions || {};
  return {
    id: apiPost.id,
    channelId: apiPost.channelId,
    content: apiPost.content,
    createdAt: apiPost.createdAt,
    author: {
      id: apiPost.author.id,
      username: apiPost.author.userName,
      displayName: apiPost.author.displayName,
      avatar: apiPost.author.avatar,
    },
    images: apiPost.images || [],
    reactions: reactions,
    stats: {
      likes: reactions.like || 0,
      comments: (apiPost as any).commentCount || (apiPost as any)._count?.comments || 0,
      shares: 0,
    },
  };
}