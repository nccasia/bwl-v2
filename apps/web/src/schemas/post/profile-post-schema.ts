import * as v from "valibot";

export const ProfilePostFilterSchema = v.object({
  authorId: v.string(),
  searchQuery: v.optional(v.string(), ""),
  sortBy: v.optional(v.picklist(["createdAt", "viewCount"]), "createdAt"),
  sortDir: v.optional(v.picklist(["asc", "desc"]), "desc"),
});

export type ProfilePostFilter = v.InferOutput<typeof ProfilePostFilterSchema>;
