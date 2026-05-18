import { create } from 'zustand';

interface HomeState {
  selectedChannelId: string | null;
  isFiltering: boolean;
  setSelectedChannelId: (id: string | null) => void;
  setFiltering: (isFiltering: boolean) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  selectedChannelId: null,
  isFiltering: false,
  setSelectedChannelId: (id) => set({ selectedChannelId: id }),
  setFiltering: (isFiltering) => set({ isFiltering }),
}));
