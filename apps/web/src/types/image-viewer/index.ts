export interface ImageViewerAuthor {
  id: string;
  displayName?: string;
  userName?: string;
  avatar?: string;
}

export interface ImageViewerPost {
  id: string;
  content: string;
  createdAt: string;
  images: string[];
  author: ImageViewerAuthor;
}

export interface ImageViewerComment {
  id: string;
  content: string;
  createdAt: string;
  author: ImageViewerAuthor;
  likesCount?: number;
  repliesCount?: number;
  replies?: ImageViewerComment[];
  parentId?: string | null;
}

export interface ImageViewerProps {
  comments?: ImageViewerComment[];
  onClose: () => void;
}

export interface UseImageViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
}

export interface ImageViewerState {
  isOpen: boolean;
  post: ImageViewerPost | null;
  currentIndex: number;
  isZoomed: boolean;
  isFullscreen: boolean;
  expandedReplies: Set<string>;

  open: (post: ImageViewerPost, index?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  setIndex: (index: number) => void;
  toggleZoom: () => void;
  toggleFullscreen: () => void;
  toggleReplies: (commentId: string) => void;
  isRepliesExpanded: (commentId: string) => boolean;
}

export interface CommentThreadProps {
  comment: ImageViewerComment;
  isRepliesExpanded: boolean;
  onToggleReplies: () => void;
}
