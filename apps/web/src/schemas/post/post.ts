import * as v from "valibot";

export const createPostSchema = v.object({
  content: v.pipe(
    v.string(),
    v.maxLength(5000, "Nội dung quá dài (tối đa 5000 ký tự)")
  ),
});

export type CreatePostInput = v.InferOutput<typeof createPostSchema>;
