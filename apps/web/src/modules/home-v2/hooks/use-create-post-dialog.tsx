import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  createPostSchema,
  type CreatePostInput,
} from "../../../schemas/post/post";
import { useAuthStore } from "@/stores/login/auth-store";
import { useCreatePostStore } from "@/stores/post/create-post-store";
import { useHomeStore } from "@/stores/home/home-store";
import { useCreatePostMutation } from "./use-create-post-mutation";
import { useTranslations } from "next-intl";
import { useImageUpload } from "@/modules/shared/hooks";
import { BaseEmoji } from "@/types/shared";

export function useCreatePostDialog() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("create-post-dialog");
  const user = useAuthStore((state) => state.user);
  const store = useCreatePostStore();
  const { isOpen } = useCreatePostStore();
  const selectedChannelId = useHomeStore((state) => state.selectedChannelId);
  const mutation = useCreatePostMutation();
  const { uploadImages, isUploading, progress } = useImageUpload();

  const form = useForm<CreatePostInput>({
    resolver: valibotResolver(createPostSchema),
    defaultValues: {
      content: store.content,
    },
    mode: "onChange",
  });

  const { formState, reset, watch, setValue, getValues } = form;

  const postContent = watch("content");
  const isDirty =
    (formState.isDirty && postContent.trim().length > 0) ||
    store.files.length > 0;

  const handleCloseAttempt = (open: boolean) => {
    if (!open && isDirty && !mutation.isPending) {
      setIsConfirmOpen(true);
    } else {
      store.close();
    }
  };

  const onSubmit = async (data: CreatePostInput) => {
    try {
      const imageUrls = await uploadImages(store.files);
      mutation.mutate(
        { content: data.content, imageUrls, channelId: selectedChannelId },
        {
          onSuccess: () => {
            store.reset();
            reset();
          },
        },
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscard = () => {
    store.reset();
    reset();
    setIsConfirmOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    store.addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onEmojiSelect = (emoji: BaseEmoji) => {
    const currentContent = getValues("content");
    const newContent = currentContent + emoji.native;
    setValue("content", newContent, {
      shouldDirty: true,
      shouldValidate: true,
    });
    store.setContent(newContent);
  };

  return {
    state: {
      form,
      postContent,
      isConfirmOpen,
      user,
      isDirty,
      errors: formState.errors,
      isPending: mutation.isPending || isUploading,
      uploadProgress: progress,
      selectedFiles: store.files,
      previewUrls: store.previewUrls,
      fileInputRef,
      isOpen,
      t,
    },
    handles: {
      handleCloseAttempt,
      onSubmit,
      handleDiscard,
      setIsConfirmOpen,
      handleFileSelect,
      removeFile: store.removeFile,
      onEmojiSelect,
      triggerFileInput: () => fileInputRef.current?.click(),
      setPostContent: (val: string) => {
        setValue("content", val, { shouldDirty: true, shouldValidate: true });
        store.setContent(val);
      },
    },
  };
}
