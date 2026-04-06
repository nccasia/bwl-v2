import { authClient } from "@/libs/auth-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { createPostSchema, type CreatePostInput } from "../schemas/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "../services/post-service";
import { useToast } from "@/modules/shared/hooks/toast";
import { CreatePostDialogProps } from "../types";

export function useCreatePostDialog({
  onOpenChange,
}: CreatePostDialogProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const { success: showToast } = useToast();

  const form = useForm<CreatePostInput>({
    resolver: valibotResolver(createPostSchema),
    defaultValues: {
      content: "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (content: string) => {
      if (!user) throw new Error("User not authenticated");
      return postService.createPost(content, {
        id: user.id,
        name: user.name || "Anonymous",
        image: user.image,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      showToast("Bài viết của bạn đã được đăng thành công!");
      reset();
      setIsConfirmOpen(false);
      onOpenChange(false);
    },
  });

  const { formState, reset, watch, setValue } = form;
  const postContent = watch("content");
  const isDirty = formState.isDirty && postContent.trim().length > 0;

  const handleCloseAttempt = (open: boolean) => {
    if (!open && isDirty && !mutation.isPending) {
      setIsConfirmOpen(true);
    } else {
      onOpenChange(open);
    }
  };

  const onSubmit = (data: CreatePostInput) => {
    mutation.mutate(data.content);
  };

  const handleDiscard = () => {
    reset();
    setIsConfirmOpen(false);
    onOpenChange(false);
  };

  return {
    state: {
      form,
      postContent,
      isConfirmOpen,
      user,
      isDirty,
      errors: formState.errors,
      isPending: mutation.isPending,
    },
    handles: {
      handleCloseAttempt,
      onSubmit,
      handleDiscard,
      setIsConfirmOpen,
      setPostContent: (val: string) => setValue("content", val, { shouldDirty: true, shouldValidate: true }),
    },
  };
}
