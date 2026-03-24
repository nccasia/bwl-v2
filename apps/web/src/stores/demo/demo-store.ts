import { create } from 'zustand';

interface DemoUIState {
  selectedId: string | null;
  isFormOpen: boolean;
  formMode: 'create' | 'edit';
  searchQuery: string;
  setSelectedId: (id: string | null) => void;
  openForm: (mode: 'create' | 'edit', id?: string) => void;
  closeForm: () => void;
  setSearchQuery: (query: string) => void;
}

export const useDemoUIStore = create<DemoUIState>((set) => ({
  selectedId: null,
  isFormOpen: false,
  formMode: 'create',
  searchQuery: '',
  setSelectedId: (id) => set({ selectedId: id }),
  openForm: (mode, id) => set({ isFormOpen: true, formMode: mode, selectedId: id ?? null }),
  closeForm: () => set({ isFormOpen: false, selectedId: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
