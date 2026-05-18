export enum WebSocketEvent {
  PONG = 'pong',
  PING = 'ping',
  OPEN = 'open',
  CLOSE = 'close',
  ERROR = 'error',
}

export enum RealtimeEvent {
  POST_REACTION_UPDATED = 'post:reaction_updated',
  POST_COMMENT_UPDATED = 'post:comment_updated',
  POST_COMMENT_CREATED = 'post:comment_created',
  COMMENT_REACTION_UPDATED = 'comment:reaction_updated',
}
