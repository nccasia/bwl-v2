import * as v from "valibot";

export const ReactionTypeValues = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"] as const;
export type ReactionType = (typeof ReactionTypeValues)[number];

export const postReactionSchema = v.object({
  postId: v.string(),
  type: v.union([
    v.picklist(ReactionTypeValues),
    v.null_(),
  ]),
});

export type PostReactionInput = v.InferOutput<typeof postReactionSchema>;
