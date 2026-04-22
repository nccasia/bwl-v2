import { ReactionStoreState } from "@/types/reaction";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useReactionStore = create<ReactionStoreState>()(
  persist(
    (set, get) => ({
      userReactions: {},
      setLiked: (targetId, isLiked) =>
        set((state) => ({
          userReactions: {
            ...state.userReactions,
            [targetId]: isLiked,
          },
        })),
      toggleLiked: (targetId) =>
        set((state) => ({
          userReactions: {
            ...state.userReactions,
            [targetId]: !state.userReactions[targetId],
          },
        })),
      isLiked: (targetId) => !!get().userReactions[targetId],
    }),
    {
      name: "reaction-storage",
    }
  )
);
