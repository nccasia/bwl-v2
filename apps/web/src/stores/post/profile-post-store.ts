import { create } from "zustand";
import { ProfilePostFilter } from "../../schemas/post/profile-post-schema";

interface ProfilePostState {
  filters: ProfilePostFilter;
  setSearchQuery: (query: string) => void;
  setSort: (sortBy: ProfilePostFilter["sortBy"], sortDir: ProfilePostFilter["sortDir"]) => void;
  resetFilters: (authorId: string) => void;
}

export const useProfilePostStore = create<ProfilePostState>((set) => ({
  filters: {
    authorId: "",
    searchQuery: "",
    sortBy: "createdAt",
    sortDir: "desc",
  },
  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),
  setSort: (sortBy, sortDir) =>
    set((state) => ({
      filters: { ...state.filters, sortBy, sortDir },
    })),
  resetFilters: (authorId) =>
    set({
      filters: {
        authorId,
        searchQuery: "",
        sortBy: "createdAt",
        sortDir: "desc",
      },
    }),
}));
