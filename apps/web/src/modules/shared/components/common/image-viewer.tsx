"use client";

import { useImageViewerStore } from "@/stores/shared/image-viewer-store";
import { ImageViewer as NewImageViewer } from "@/modules/image-viewer/components/image-viewer";

export function ImageViewer() {
  const { isOpen, post, close } = useImageViewerStore();

  if (!isOpen || !post) return null;

  return <NewImageViewer onClose={close} />;
}
