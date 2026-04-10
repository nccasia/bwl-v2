export interface Author {
  id: string;
  name: string;
  image?: string | null;
}

export interface PostStats {
  likes: number;
  comments: number;
  shares: number;
}

export interface Post {
  id: string;
  content: string;
  author: Author;
  stats: PostStats;
  createdAt: string;
  images: string[];
}

export interface Contributor {
  id: string;
  name: string;
  pts: number;
  image?: string | null;
}

export interface Channel {
  id: string;
  name: string;
  postCount: number;
}

export interface LeaderboardEntry {
  id: string;
  user: Author;
  postCount: number;
  rank: number;
}

export interface PostCardProps {
  post: Post;
}

export interface StoriesProps {
  authors: Contributor[];
  isLoading: boolean;
}

export interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}


