export const QUERY_KEYS = {
  DEMO: {
    getKey: () => ["demo"],
    invalidate: () => ["demo"],
  },
  DEMO_LIST:  {
    getKey: (params?: Record<string, unknown>) => ["demo", "list", params],
    invalidate: () => ["demo", "list"],
  },
  DEMO_ITEM: {
    getKey: (id: string | null) => ["demo", "item", id],
    invalidate: () => ["demo", "item"],
  },
  USERS: {
    GET_BY_ID: {
      getKey: (userId: string) => ["users", "id", userId],
      invalidate: (userId: string) => ["users", "id", userId],
    },
  },
  HOME_V2: {
    CHANNELS_WITH_COUNTS: {
      getKey: () => ["home-v2", "channels-with-counts"],
      invalidate: () => ["home-v2", "channels-with-counts"],
    },
    LEADERBOARD: {
      getKey: () => ["home-v2", "leaderboard"],
      invalidate: () => ["home-v2", "leaderboard"],
    },
    POSTS: {
      getKey: () => ["home-v2", "posts"],
      invalidate: () => ["home-v2", "posts"],
    },
    CHANNELS: {
      getKey: () => ["home-v2", "channels"],
      invalidate: () => ["home-v2", "channels"],
    },
    CONTRIBUTORS: {
      getKey: () => ["home-v2", "contributors"],
      invalidate: () => ["home-v2", "contributors"],
    },
  },
  PROFILE: {
    GET_BY_USERNAME: {
      getKey: (username: string) => ["profile", "username", username],
      invalidate: (username: string) => ["profile", "username", username],
    },
    POSTS: {
      getKey: (filters?: Record<string, unknown>) => ["profile", "posts", filters],
      invalidate: () => ["profile", "posts"],
    },
  },
  COMMENTS: {
    GET_BY_POST: {
      getKey: (postId: string, params?: Record<string, unknown>) => ["comments", "post", postId, params],
      invalidate: (postId: string) => ["comments", "post", postId],
    },
    GET_REPLIES: {
      getKey: (commentId: string, params?: Record<string, unknown>) => ["comments", "replies", commentId, params],
      invalidate: (commentId: string) => ["comments", "replies", commentId],
    },
  },
}
