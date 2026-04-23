export interface Author {
  id: string;
  displayName?: string
  userName?: string;
  avatar?: string;
}

export interface PostStats {
  likes: number;
  comments: number;
  shares: number;
}

export interface Post {
  id: string;
  channelId?: string | null;
  content: string;
  author: Author;
  stats: PostStats;
  createdAt: string;
  images: string[];
  reactions?: Record<string, number>;
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
  mezonChannelId: string;
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


