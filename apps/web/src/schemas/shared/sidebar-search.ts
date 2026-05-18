import * as v from "valibot";

export const sidebarSearchSchema = v.object({
  query: v.pipe(
    v.string(),
    v.minLength(1, "Vui lòng nhập từ khóa"),
    v.maxLength(50, "Từ khóa quá dài")
  ),
});

export type SidebarSearchInput = v.InferOutput<typeof sidebarSearchSchema>;
