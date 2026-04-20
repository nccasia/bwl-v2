"use server";

import * as commentService from "./comment-service";
import { CreateCommentInput } from "@/schemas/comments/comment-schema";
import { QueryParams } from "@/types/shared";

export async function createCommentAction(data: CreateCommentInput) {
    return commentService.createComment(data);
}

export async function getCommentsByPostAction(postId: string, params: QueryParams = {}) {
    return commentService.getCommentsByPost(postId, params);
}

export async function getCommentRepliesAction(commentId: string, params: QueryParams = {}) {
    return commentService.getCommentReplies(commentId, params);
}
