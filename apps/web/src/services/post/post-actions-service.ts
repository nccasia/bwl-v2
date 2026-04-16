"use server";

import { apiClient } from "@/libs/api-client";
import { FileUploadResponseDto } from "@/types/shared/base-api";
import { createPostService, getPosts, getLeaderboard } from ".";

export async function createPostAction(content: string, images?: string[], channelId?: string) {
  try {
    const result = await createPostService(content, images, channelId);
    return result;
  } catch (e) {
    return {
      isSuccess: false,
      message: `${e}`,
      statusCode: 500,
    };
  }
}

export async function getUploadUrlAction(metadata: {
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  try {
    const response = await apiClient.post<FileUploadResponseDto>(
      "/v1/uploads/post-image",
      metadata
    );
    return response;
  } catch (e) {
    return {
      isSuccess: false,
      message: `${e}`,
      statusCode: 500,
    };
  }
}

export async function getPostsAction(page: number, limit: number = 10) {
  try {
    const result = await getPosts(page, limit);
    return result;
  } catch (e) {
    return {
      isSuccess: false,
      message: `${e}`,
      statusCode: 500,
    };
  }
}

export async function getLeaderboardAction() {
  try {
    const result = await getLeaderboard();
    return result;
  } catch (e) {
    return {
      isSuccess: false,
      message: `${e}`,
      statusCode: 500,
      data: []
    };
  }
}

