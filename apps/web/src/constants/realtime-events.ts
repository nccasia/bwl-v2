export const REALTIME_EVENTS = {
  POST_REACTION_UPDATED: "post:reaction_updated",
  POST_COMMENT_UPDATED: "post:comment_updated",
  POST_COMMENT_CREATED: "post:comment_created",
  COMMENT_REACTION_UPDATED: "comment:reaction_updated",
} as const;

export type RealtimeEventType = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];
