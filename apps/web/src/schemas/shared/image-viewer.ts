import * as v from "valibot";

export const jumpToSchema = v.object({
  index: v.pipe(
    v.number(),
    v.minValue(1, "Phải lớn hơn hoặc bằng 1"),
    v.integer("Phải là số nguyên")
  ),
});

export type JumpToInput = v.InferOutput<typeof jumpToSchema>;
