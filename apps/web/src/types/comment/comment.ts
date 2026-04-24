import { Author } from "../home-v2";
import { BaseEntity } from "../shared";

export interface Comment extends BaseEntity {
  postId: string;
  authorId: string;
  parentId?: string | null;
  content: string;
  isEdited: boolean;
  author?: Author;
  reactions?: Record<string, string[]>;
  _count?: {
    replies: number;
  };
}

export interface CommentResponse {
  data: Comment[];
  pagination: {
    totalPage: number;
    total: number;
    pageSize: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface CommentInputProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
  initialValue?: string;
}

export interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

