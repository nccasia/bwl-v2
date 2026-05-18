import * as v from "valibot";

export const reportSchema = v.object({
  reason: v.pipe(
    v.string(),
    v.minLength(1, "Vui lòng chọn lý do"),
  ),
  details: v.pipe(
    v.string(),
    v.maxLength(200, "Chi tiết không quá 200 ký tự"),
  ),
});

export type ReportInput = v.InferOutput<typeof reportSchema>;
