import { create } from 'zustand';

interface CommentSectionState {
  emptyFetchCount: number;
  lastUniqueCount: number;
  stableHasNextPage: boolean;
  activeReplyId: string | null;
}

interface CommentStore {
  postStates: Record<string, CommentSectionState>;
  recordFetchResult: (postId: string, currentCount: number) => void;
  resetState: (postId: string) => void;
  getStableHasNextPage: (postId: string) => boolean;
  setActiveReplyId: (postId: string, commentId: string | null) => void;
  getActiveReplyId: (postId: string) => string | null;
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  postStates: {},
  
  recordFetchResult: (postId, currentCount) => {
    set((state) => {
      const currentState = state.postStates[postId] || {
        emptyFetchCount: 0,
        lastUniqueCount: 0,
        stableHasNextPage: true,
        activeReplyId: null,
      };

      if (currentCount === 0) return state;

      if (currentCount === currentState.lastUniqueCount) {
        const newEmptyFetchCount = currentState.emptyFetchCount + 1;
        return {
          postStates: {
            ...state.postStates,
            [postId]: {
              ...currentState,
              emptyFetchCount: newEmptyFetchCount,
              stableHasNextPage: newEmptyFetchCount < 3,
            },
          },
        };
      }

      return {
        postStates: {
          ...state.postStates,
          [postId]: {
            ...currentState,
            emptyFetchCount: 0,
            lastUniqueCount: currentCount,
            stableHasNextPage: true,
          },
        },
      };
    });
  },

  setActiveReplyId: (postId, commentId) => {
    set((state) => ({
      postStates: {
        ...state.postStates,
        [postId]: {
          ...(state.postStates[postId] || {
            emptyFetchCount: 0,
            lastUniqueCount: 0,
            stableHasNextPage: true,
          }),
          activeReplyId: commentId,
        },
      },
    }));
  },

  getActiveReplyId: (postId) => {
    return get().postStates[postId]?.activeReplyId ?? null;
  },

  resetState: (postId) => {
    set((state) => ({
      postStates: Object.fromEntries(
        Object.entries(state.postStates).filter(([key]) => key !== postId)
      ),
    }));
  },

  getStableHasNextPage: (postId) => {
    return get().postStates[postId]?.stableHasNextPage ?? true;
  },
}));
