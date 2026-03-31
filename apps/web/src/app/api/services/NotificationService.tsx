import { useEffect, useState } from "react";
import { Notification } from "@/components/notifications/hook/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { BE_URL } from "@/types/gallery";
import { Comment, Reactions } from "@/types/gallery";


export const useNotificationHandler = (BE_URL: string) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isFetchingPost, setIsFetchingPost] = useState(false);

  const handleNotificationClick = async (
    n: Notification,
    markOneRead: (id: string) => void
  ) => {
    if (!n.read) markOneRead(n._id);

    if (n.postId) {
      setSelectedPost(null);      // clear previous
      setIsDialogOpen(true);       // ← open dialog immediately (shows skeleton)
      setIsFetchingPost(true);
      try {
        const res = await fetch(`${BE_URL}/bwl/${n.postId}`);
        if (res.ok) {
          const json = await res.json();
          setSelectedPost(json.data || json);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setIsDialogOpen(false);
      } finally {
        setIsFetchingPost(false);
      }
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPost(null);
  };

  return {
    handleNotificationClick,
    isFetchingPost,
    isDialogOpen,
    selectedPost,
    setSelectedPost,
    closeDialog,
  };
};

export const useAvatarResolver = (BE_URL: string) => {
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [postImageMap, setPostImageMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const resolveAvatars = async () => {
      try {
        const res = await fetch(`${BE_URL}/bwl?limit=100`);
        if (res.ok) {
          const json = await res.json();
          const posts: any[] = json.data || [];

          const map: Record<string, string> = {};
          const nMap: Record<string, string> = {};
          const pImgMap: Record<string, string> = {};

          posts.forEach((p) => {
            if (p.authorId) {
              if (p.authorAvatar) map[p.authorId] = p.authorAvatar;

              const dName =
                p.authorDisplayName || p.display_name || p.authorName;

              if (dName) nMap[p.authorId] = dName;
            }
            if (p.id && p.images?.[0]) {
              pImgMap[p.id] = p.images[0];
            }
          });

          setAvatarMap(map);
          setNameMap(nMap);
          setPostImageMap(pImgMap);
        }
      } catch (err) {
        console.error("Avatar resolution failed:", err);
      }
    };

    resolveAvatars();
  }, [BE_URL]);

  return { avatarMap, nameMap, postImageMap };
};

export const handleReact = async (emoji: string) => {
  const [reactions, setReactions] = useState<Reactions>({});
  const [totalLike, setTotalLike] = useState(0);
  const { user } = useAuth();
  const { selectedPost } = useNotificationHandler(BE_URL);
  if (!user || !selectedPost) return;

  try {
    const res = await fetch(`${BE_URL}/bwl/${selectedPost.id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.username, emoji }),
    });

    if (res.ok) {
      const data: Reactions = await res.json();
      setReactions(data);

      const total = Object.values(data).reduce(
        (s, v) => s + (Array.isArray(v) ? v.length : 0),
        0
      );

      setTotalLike(total);
    }
  } catch (err) {
    console.error("Failed to react:", err);
  }
};

export const NotificationService = {
  async getList(userId: string): Promise<Notification[]> {
    try {
      const res = await fetch(`${BE_URL}/notifications?userId=${userId}`)
      const json = await res.json()
      return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') return []
      console.error('NotificationService.getList error:', err)
      return []
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const res = await fetch(`${BE_URL}/notifications/unread-count?userId=${userId}`)
      const json = await res.json()
      return typeof json === "number" ? json : json.unread || 0
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') return 0
      console.error('NotificationService.getUnreadCount error:', err)
      return 0
    }
  },

  async markAllRead(userId: string): Promise<void> {
    await fetch(`${BE_URL}/notifications/read-all?userId=${userId}`, { method: "PATCH" })
  },

  async markOneRead(id: string, userId: string): Promise<Response> {
    return fetch(`${BE_URL}/notifications/${id}/read?userId=${userId}`, { method: "PATCH" })
  },

  createStream(userId: string): EventSource {
    return new EventSource(`${BE_URL}/notifications/stream?userId=${userId}`)
  },
}
