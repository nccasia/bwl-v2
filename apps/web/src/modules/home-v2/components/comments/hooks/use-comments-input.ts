import { useAuthStore } from "@/stores/login/auth-store";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { createCommentSchema, CreateCommentInput } from "@/schemas/comments/comment-schema";
import { useCreateComment } from "./use-comments";
import { CommentInputProps } from "@/types/comment/comment";

export function useCommentsInput({
  postId,
  parentId,
  onSuccess,
  initialValue,
}: CommentInputProps) {
  const t = useTranslations("home");
  const user = useAuthStore((state) => state.user);
  const createComment = useCreateComment();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isValid },
  } = useForm<CreateCommentInput>({
    resolver: valibotResolver(createCommentSchema),
    mode: "onChange",
    defaultValues: {
      postId,
      parentId,
      content: initialValue || "",
    },
  });

  const content = watch("content");

  const onSubmit = (data: CreateCommentInput) => {
    createComment.mutate(data, {
      onSuccess: () => {
        reset({ postId, parentId, content: "" });
        onSuccess?.();
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const isSubmitDisabled = !content || !content.trim() || !isValid || createComment.isPending;

  if (!user) return null;

  return {
    state: {
      t,
      user,
      register,
      handleSubmit,
      onSubmit,
      handleKeyDown,
      isSubmitDisabled,
      isPending: createComment.isPending,
      content,
    },
  };
}