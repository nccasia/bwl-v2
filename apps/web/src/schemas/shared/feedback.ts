import * as v from "valibot";

export const feedbackSchema = v.object({
  content: v.pipe(
    v.string(),
    v.minLength(10, "Nội dung phải có ít nhất 10 ký tự"),
    v.maxLength(500, "Nội dung quá dài")
  ),
});

export type FeedbackInput = v.InferOutput<typeof feedbackSchema>;
