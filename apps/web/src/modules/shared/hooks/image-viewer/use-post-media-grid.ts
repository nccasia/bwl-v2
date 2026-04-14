import { useImageViewerStore } from "@/stores/shared/image-viewer-store";
import { useQuery } from "@tanstack/react-query";

export function usePostMediaGrid(images: string[]) {
  const openViewer = useImageViewerStore((state) => state.open);

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
    openViewer(images, index);
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
