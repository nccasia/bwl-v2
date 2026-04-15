import { create } from "zustand";

interface LoginRequiredState {
  isOpen: boolean;
  
  open: () => void;
  close: () => void;
}

export const useLoginRequiredStore = create<LoginRequiredState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
