import { apiClient } from "@/libs/api-client";
import { LikeReactionDto, Reaction } from "@/types/reaction";
import { ApiResponse } from "@/types/shared";

export async function likeTarget(dto: LikeReactionDto): Promise<ApiResponse<Reaction>> {
  return apiClient.post<Reaction>("/v1/reactions/like", dto);
}

export async function unlikeTarget(targetType: string, targetId: string): Promise<ApiResponse<{ unliked: boolean }>> {
  return apiClient.delete<{ unliked: boolean }>(`/v1/reactions/unlike/${targetType}/${targetId}`);
}

export async function getReactionsByTarget(targetType: string, targetId: string): Promise<ApiResponse<Reaction[]>> {
  return apiClient.get<Reaction[]>(`/v1/reactions/get-by-target/${targetType}/${targetId}`);
}
