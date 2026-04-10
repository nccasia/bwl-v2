import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ReactionType } from "@/schemas/post/reaction";

interface ReactionState {
  userReactions: Record<string, ReactionType | null>;
  setReaction: (postId: string, type: ReactionType | null) => void;
  getReaction: (postId: string) => ReactionType | null;
}

export const useReactionStore = create<ReactionState>()(
  persist(
    (set, get) => ({
      userReactions: {},
      setReaction: (postId, type) =>
        set((state) => ({
          userReactions: {
            ...state.userReactions,
            [postId]: type,
          },
        })),
      getReaction: (postId) => get().userReactions[postId] ?? null,
    }),
    {
      name: "post-reaction-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
