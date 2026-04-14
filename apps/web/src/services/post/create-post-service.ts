import { apiClient } from "@/libs/api-client";
import { PostResponse } from '@/types/post';

export async function createPostService(content: string, images?: string[], channelId?: string) {
    return apiClient.post<PostResponse>("/v1/posts/create-post", {
        content,
        title: content.substring(0, 50),
        channelId,
        status: "published",
        isPinned: false,
        images: images,
    });
}