import { create } from "zustand";

interface ImageViewerState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;

  open: (images: string[], index?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  setIndex: (index: number) => void;
}

export const useImageViewerStore = create<ImageViewerState>((set) => ({
  isOpen: false,
  images: [],
  currentIndex: 0,

  open: (images, index = 0) =>
    set({
      isOpen: true,
      images,
      currentIndex: index,
    }),

  close: () => set({ isOpen: false, images: [], currentIndex: 0 }),

  next: () =>
    set((state) => ({
      currentIndex: (state.currentIndex + 1) % state.images.length,
    })),

  prev: () =>
    set((state) => ({
      currentIndex:
        (state.currentIndex - 1 + state.images.length) % state.images.length,
    })),

  setIndex: (currentIndex) => set({ currentIndex }),
}));
