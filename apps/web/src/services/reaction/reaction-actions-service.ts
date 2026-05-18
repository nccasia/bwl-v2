"use server";

import { LikeReactionDto } from "@/types/reaction";
import * as reactionService from "./reaction-service";

export async function likeTargetAction(dto: LikeReactionDto) {
  return reactionService.likeTarget(dto);
}

export const unlikeTargetAction = async (targetType: string, targetId: string) => {
  return reactionService.unlikeTarget(targetType, targetId);
};

export const getReactionsByTargetAction = async (targetType: string, targetId: string) => {
  return reactionService.getReactionsByTarget(targetType, targetId);
};
