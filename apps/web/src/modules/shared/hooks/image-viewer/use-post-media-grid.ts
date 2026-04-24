import { useImageViewerStore } from "@/stores/shared/image-viewer-store";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/login/auth-store";
import { useLoginRequiredStore } from "@/stores/shared/login-required-store";
import type { ImageViewerPost } from "@/types/image-viewer";

export function usePostMediaGrid(post: ImageViewerPost) {
  const images = post.images || [];
  const openViewer = useImageViewerStore((state) => state.open);
  const isAuthenticated = useAuthStore((state) => !!state.user);
  const openLoginRequired = useLoginRequiredStore((state) => state.open);

  const { data: imageStats } = useQuery({
    queryKey: ["image-stats", images[0]],
    queryFn: async () => {
      return {
        views: "1.2K",
        likes: 85,
      };
    },
    enabled: !!images[0],
  });

  const handleImageClick = (index: number) => {
    if (!isAuthenticated) {
      openLoginRequired();
      return;
    }
    openViewer(post, index);
  };

  return {
    state: {
      imageStats,
    },
    actions: {
      handleImageClick,
    },
  };
}
