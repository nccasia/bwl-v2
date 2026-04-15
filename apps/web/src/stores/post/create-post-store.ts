import { create } from "zustand";

interface CreatePostState {
  isOpen: boolean;
  content: string;
  files: File[];
  previewUrls: string[];
  
  open: () => void;
  close: () => void;
  setContent: (content: string) => void;
  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  reset: () => void;
}

export const useCreatePostStore = create<CreatePostState>((set) => ({
  isOpen: false,
  content: "",
  files: [],
  previewUrls: [],

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  
  setContent: (content) => set({ content }),
  
  setFiles: (files) => {
    set((state) => {
      state.previewUrls.forEach((url) => URL.revokeObjectURL(url));
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      return { files, previewUrls };
    });
  },

  addFiles: (newFiles) => {
    set((state) => {
      const validFiles = newFiles.filter((file) => file.type.startsWith("image/"));
      const newUrls = validFiles.map((file) => URL.createObjectURL(file));
      return {
        files: [...state.files, ...validFiles],
        previewUrls: [...state.previewUrls, ...newUrls],
      };
    });
  },

  removeFile: (index) => {
    set((state) => {
      URL.revokeObjectURL(state.previewUrls[index]);
      return {
        files: state.files.filter((_, i) => i !== index),
        previewUrls: state.previewUrls.filter((_, i) => i !== index),
      };
    });
  },

  reset: () => {
    set((state) => {
      state.previewUrls.forEach((url) => URL.revokeObjectURL(url));
      return {
        isOpen: false,
        content: "",
        files: [],
        previewUrls: [],
      };
    });
  },
}));
