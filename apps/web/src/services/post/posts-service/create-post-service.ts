import 'server-only'

import { apiClient } from "@/libs/api-client";
import { PostResponse } from "@/types/post";

export class CreatePostService {
    createPost(content: string, images?: string[]) {
        return apiClient.post<PostResponse>("/v1/posts/create-post", {
            content,
            title: content.substring(0, 50),
            channelId: null,
            status: "published",
            isPinned: false,
            images: images,
        });
    }
}