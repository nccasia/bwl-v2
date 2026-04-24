"use client";

import { useImageViewerStore } from "@/stores/shared/image-viewer-store";
import { ImageViewer as NewImageViewer } from "@/modules/image-viewer/components/image-viewer";

export function ImageViewer() {
  const { isOpen, post, currentIndex, close } = useImageViewerStore();

  if (!isOpen || !post) return null;

  return (
    <ImageViewerContent
      post={post}
      initialIndex={currentIndex}
      isOpen={isOpen}
      onClose={close}
    />
  );
}

function ImageViewerContent({
  onClose,
}: {
  onClose: () => void;
}) {
  return <NewImageViewer onClose={onClose} />;
}
