"use client";

import { useEffect, useState } from "react";
import { useImageViewerStore } from "@/stores/shared/image-viewer-store";

export function useImageViewer() {
  const store = useImageViewerStore();
  const [isMounted, setIsMounted] = useState(false);
  const images = store.post?.images ?? [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (store.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [store.isOpen]);

  useEffect(() => {
    if (!store.isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") store.prev();
      if (e.key === "ArrowRight") store.next();
      if (e.key === "Escape") {
        if (store.isZoomed) {
          store.toggleZoom();
        } else {
          store.close();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [store.isOpen, store]);

  return {
    state: {
      currentIndex: store.currentIndex,
      isZoomed: store.isZoomed,
      isFullscreen: store.isFullscreen,
      totalImages: images.length,
      currentImage: images[store.currentIndex] ?? "",
      hasPrev: images.length > 1,
      hasNext: images.length > 1,
      isOpen: store.isOpen,
      post: store.post,
      isMounted,
    },
    handlers: {
      goToPrev: store.prev,
      goToNext: store.next,
      toggleZoom: store.toggleZoom,
      toggleFullscreen: store.toggleFullscreen,
      close: store.close,
    },
  };
}
