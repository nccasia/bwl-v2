export enum ReactionTargetType {
  Post = 'post',
  Comment = 'comment',
}

export interface Reaction {
  id: string;
  userId: string;
  targetId: string;
  targetType: ReactionTargetType;
  createdAt: string;
  updatedAt: string;
}

export interface LikeReactionDto {
  targetId: string;
  targetType: ReactionTargetType;
}


export interface ReactionStoreState {
  userReactions: Record<string, boolean>;
  setLiked: (targetId: string, isLiked: boolean) => void;
  toggleLiked: (targetId: string) => void;
  isLiked: (targetId: string) => boolean;
}
