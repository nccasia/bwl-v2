import { createPostAction } from "@/actions/post-actions";
import { useToast } from "@/modules/shared/hooks";
import { uploadService } from "@/services/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  const { success: showToast } = useToast();
  const t = useTranslations("create-post-dialog");

  return useMutation({
    mutationFn: async ({
      content,
      files,
    }: {
      content: string;
      files: File[];
    }) => {
      const imageUrls =
        files.length > 0
          ? await uploadService.uploadMultiplePostImages(files)
          : [];

      const response = await createPostAction(content, imageUrls);

      if (!response.isSuccess) {
        throw new Error(
          Array.isArray(response.message)
            ? response.message.join(", ")
            : response.message,
        );
      }

      return response.data;
    },
    onSuccess: () => {
      showToast(t("post-success"));
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}