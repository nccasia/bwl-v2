import { create } from "zustand";
import type { ImageViewerState } from "@/types/image-viewer";

export const useImageViewerStore = create<ImageViewerState>((set, get) => ({
  isOpen: false,
  post: null,
  currentIndex: 0,
  isZoomed: false,
  isFullscreen: false,
  expandedReplies: new Set(),

  open: (post, index = 0) =>
    set({
      isOpen: true,
      post,
      currentIndex: index,
      isZoomed: false,
      isFullscreen: false,
      expandedReplies: new Set(),
    }),

  close: () => {
    if (get().isFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
    set({
      isOpen: false,
      post: null,
      currentIndex: 0,
      isZoomed: false,
      isFullscreen: false,
      expandedReplies: new Set(),
    });
  },

  next: () =>
    set((state) => ({
      currentIndex: state.post
        ? (state.currentIndex + 1) % state.post.images.length
        : 0,
      isZoomed: false,
    })),

  prev: () =>
    set((state) => ({
      currentIndex: state.post
        ? (state.currentIndex - 1 + state.post.images.length) %
          state.post.images.length
        : 0,
      isZoomed: false,
    })),

  setIndex: (currentIndex) => set({ currentIndex, isZoomed: false }),

  toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),

  toggleFullscreen: () => {
    const isFullscreen = !!document.fullscreenElement;
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
    set({ isFullscreen: !isFullscreen });
  },

  toggleReplies: (commentId: string) => {
    set((state) => {
      const next = new Set(state.expandedReplies);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return { expandedReplies: next };
    });
  },

  isRepliesExpanded: (commentId: string) =>
    get().expandedReplies.has(commentId),
}));
