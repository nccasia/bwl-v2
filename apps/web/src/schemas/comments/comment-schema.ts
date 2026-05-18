import * as v from 'valibot';

export const createCommentSchema = v.object({
  postId: v.pipe(v.string()),
  parentId: v.optional(v.pipe(v.string())),
  replyToUserId: v.optional(v.pipe(v.string())),
  content: v.pipe(v.string(), v.minLength(1, 'Comment content cannot be empty'), v.maxLength(1000, 'Comment content is too long')),
});

export type CreateCommentInput = v.InferInput<typeof createCommentSchema>;
