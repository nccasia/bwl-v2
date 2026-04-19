import { apiClient } from "@/libs/api-client";
import { CreateCommentInput } from "@/schemas/comments/comment-schema";
import { Comment } from "@/types/comment/comment";
import { ApiResponse, QueryParams } from "@/types/shared";

export async function createComment(data: CreateCommentInput): Promise<ApiResponse<Comment>> {
  return apiClient.post<Comment>("/v1/comments/create-comment", data);
}

export async function getCommentsByPost(postId: string, params: QueryParams = {}): Promise<ApiResponse<Comment[]>> {
  if (!postId) return { 
    data: [], 
    pagination: { total: 0, totalPage: 0, pageSize: 20, currentPage: 1 },
    statusCode: 200,
    isSuccess: true
  };
  
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
  });
  if (params.search) query.append("search", params.search);

  const queryString = query.toString();
  const endpoint = `/v1/comments/get-by-post/${postId}${queryString ? `?${queryString}` : ""}`;
  
  return apiClient.get<Comment[]>(endpoint);
}

export async function getCommentReplies(commentId: string, params: QueryParams = {}): Promise<ApiResponse<Comment[]>> {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
  });
  
  return apiClient.get<Comment[]>(`/v1/comments/get-replies/${commentId}?${query.toString()}`);
}