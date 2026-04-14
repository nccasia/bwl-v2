import { createPostAction } from "@/services/post/post-actions-service";
import { useToast } from "@/modules/shared/hooks";
import { uploadService } from "@/services/post/post-images-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { QUERY_KEYS } from "@/constants/query-key";

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  const { success: showToast } = useToast();
  const t = useTranslations("create-post-dialog");

  return useMutation({
    mutationFn: async ({
      content,
      files,
      channelId,
    }: {
      content: string;
      files: File[];
      channelId?: string | null;
    }) => {
      const imageUrls =
        files.length > 0
          ? await uploadService.uploadMultiplePostImages(files)
          : [];

      const response = await createPostAction(content, imageUrls, channelId || "");

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
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.HOME_V2.POSTS.getKey(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.HOME_V2.CHANNELS_WITH_COUNTS.getKey(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.HOME_V2.LEADERBOARD.getKey(),
      });
    },
  });
}