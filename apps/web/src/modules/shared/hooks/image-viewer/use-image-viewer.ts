import { useCallback, useEffect } from "react";
import { useImageViewerStore } from "@/stores/shared/image-viewer-store";
import { JumpToInput, jumpToSchema } from "@/schemas/shared/image-viewer";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

interface ViewerImageMetadata {
  size: string;
  format: string;
  dimensions: string;
}

export function useImageViewer() {
  const store = useImageViewerStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!store.isOpen) return;
      if (e.key === "ArrowRight") store.next();
      if (e.key === "ArrowLeft") store.prev();
      if (e.key === "Escape") store.close();
    },
    [store]
  );

  const form = useForm<JumpToInput>({
    resolver: valibotResolver(jumpToSchema),
    defaultValues: { index: store.currentIndex + 1 },
  });

  useEffect(() => {
    form.setValue("index", store.currentIndex + 1);
  }, [store.currentIndex, form]);

  const { data: metadata, isLoading: isLoadingMeta } = useQuery<ViewerImageMetadata>({
    queryKey: ["image-metadata", store.images[store.currentIndex]],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        size: "1.2 MB",
        format: "JPEG",
        dimensions: "1920x1080",
      };
    },
    enabled: store.isOpen && !!store.images[store.currentIndex],
  });

  const onJumpTo = (data: JumpToInput) => {
    const targetIndex = data.index - 1;
    if (targetIndex >= 0 && targetIndex < store.images.length) {
      store.setIndex(targetIndex);
    }
  };

  useEffect(() => {
    if (!store.isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store.isOpen, handleKeyDown]);

  return {
    state: {
      ...store,
      form,
      metadata,
      isLoadingMeta,
    },
    actions: {
      ...store,
      onJumpTo,
    },
  };
}
