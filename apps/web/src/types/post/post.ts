export enum PostStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export interface Post {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  authorId: string;
  channelId: string | null;
  title: string | null;
  content: string;
  status: PostStatus;
  isPinned: boolean;
  viewCount: number;
  images: string[];
  reactions: Record<string, number>;
  commentCount?: number;
  _count?: { comments?: number; replies?: number };
  author: {
    id: string;
    displayName: string;
    userName: string;
    avatar: string;
  };
}

export interface PostResponse {
  data: Post[];
  pagination: {
    limit: number;
    nextCursor?: string;
    hasNextPage: boolean;
  };
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}