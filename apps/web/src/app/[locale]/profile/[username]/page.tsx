"use client";

import { Camera, MapPin, Link as LinkIcon, Calendar, Grid3x3, Heart, MessageCircle, Images, Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { BE_URL, Post, Reactions, Comment } from "@/types/gallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PostCommentDialog } from "@/components/post/post_card/PostCommentDialog/PostCommentDialog";
import { useParams } from "next/navigation";
import { fetchPosts, fetchStats, fetchDetailedStats, reactToPost } from "@/app/api/services/ProfileService";
import { LIMIT, Stats } from "@/components/profile/Profile.type";



export default function Profile() {
  const { user, ready } = useAuth();
  const [activeTab, setActiveTab] = useState("Posts");
  const tabs = ["Posts", "Photos"];

  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reactions>({});
  const [totalLike, setTotalLike] = useState(0);
  const params = useParams()
  const username = decodeURIComponent(params.username as string)
  const isOwn = user?.username === username

  useEffect(() => {
    if (!ready) return;
    
    const loadPosts = async () => {
      setLoading(true);
      try {
        const data = await fetchPosts(username, page, LIMIT);
        setPosts(prev => page === 1 ? data.data : [...prev, ...data.data]);
        setTotal(data.total);
      } catch (err) {
        console.error("Error loading posts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [page, username, ready]);

  useEffect(() => {
    if (!ready) return;

    const loadStats = async () => {
      try {
        const data = await fetchStats(username);
        setStats(prev => prev ? { ...data, totalLikes: prev.totalLikes } : data);
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    };

    loadStats();
  }, [username, ready]);

  useEffect(() => {
    if (ready && posts.length > 0) {
      const loadDetailedStats = async () => {
        try {
          const { globalSum, totalPosts, reactionMap } = await fetchDetailedStats(username);

          setStats(prev => ({ 
            ...prev, 
            totalLikes: globalSum, 
            totalPosts: totalPosts, 
            totalComments: prev?.totalComments || 0 
          }));

          setPosts(prev => prev.map(p => ({
            ...p,
            totalLike: reactionMap[p.id] ?? p.totalLike
          })));
        } catch (err) {
          console.error("Failed detailed likes fetch:", err);
        }
      };
      loadDetailedStats();
    }
  }, [username, ready, posts.length]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Cover Photo */}
      <div className="relative h-80 bg-linear-to-br from-black/50 via-black/10 to-black/50">
        <img
          src="/assets/img/bg_login.jpg"
          alt="Cover"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative">
            <img
              src={(isOwn ? user?.avatar : posts[0]?.authorAvatar) || "/assets/img/mezon-logo.webp"}
              alt="Profile"
              className="w-40 h-40 rounded-3xl object-cover border-4 border-background shadow-2xl bg-muted"
            />
          </div>

          <div className="flex-1 pt-12">
            <div className="py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-foreground text-4xl font-black mb-1">
                  {(isOwn ? (user?.displayName || user?.username) : (posts[0]?.authorDisplayName || posts[0]?.display_name || username)) || "Người dùng BWL"}
                </h1>
                <p className="text-brand font-bold tracking-tight text-lg mt-1 opacity-80">@{username}</p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              
            </div>
            </div>
          </div>
        </div>

        {/* Stats Widget */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-card border border-border p-6 text-center shadow-sm">
            {stats ? (
              <div className="text-3xl text-foreground mb-1">{stats.totalPosts.toLocaleString()}</div>
            ) : (
              <Skeleton className="h-9 w-20 mx-auto mb-1 bg-muted" />
            )}
            <div className="text-sm text-muted-foreground">Bài viết</div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 text-center shadow-sm">
            {stats ? (
              <div className="text-3xl text-foreground mb-1">{stats.totalLikes.toLocaleString()}</div>
            ) : (
              <Skeleton className="h-9 w-20 mx-auto mb-1 bg-muted" />
            )}
            <div className="text-sm text-muted-foreground">Lượt thích</div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 text-center shadow-sm">
            {stats ? (
              <div className="text-3xl text-foreground mb-1">{stats.totalComments.toLocaleString()}</div>
            ) : (
              <Skeleton className="h-9 w-20 mx-auto mb-1 bg-muted" />
            )}
            <div className="text-sm text-muted-foreground">Bình luận</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="rounded-2xl bg-card border border-border p-2 mb-8 shadow-sm">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab
                    ? "bg-brand/10 text-brand border border-brand/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Tab */}
        {activeTab === "Posts" && (
          <div className="space-y-8 pb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[250px] gap-6">
              {posts.map((post, index) => {
                // Logic for Bento grid effect: indices 0, 7, 10 etc. get spans
                let spanClass = "";
                const i = index % 12;
                if (i === 0) spanClass = "md:col-span-2 md:row-span-2 shadow-2xl z-10 scale-[1.02] -rotate-1";
                else if (i === 5) spanClass = "md:row-span-2";
                else if (i === 6) spanClass = "md:col-span-2 md:row-span-1";
                else if (i === 9) spanClass = "md:col-span-2 md:row-span-2 shadow-xl z-20 rotate-1";

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-card border border-border transition-all duration-700 hover:border-brand/50 hover:shadow-brand/20 hover:-translate-y-2 active:scale-95 ${spanClass}`}
                  >
                    {post.images[0] ? (
                      <img
                        src={post.images[0]}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Images className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                    )}
                    
                    {/* Image Count Badge */}
                    {post.images.length > 1 && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-2xl bg-background/60 backdrop-blur-xl border border-border text-xs text-foreground font-black flex items-center gap-2 z-10 shadow-lg">
                        <Images className="w-4 h-4" />
                        {post.images.length}
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 h-1/2">
                      <div className="flex items-center gap-6 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-2.5 text-white/90">
                          <div className="p-2 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/30">
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          </div>
                          <span className="text-lg font-black tracking-tight drop-shadow-md">{post.totalLike || 0}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-white/90">
                          <div className="p-2 rounded-full bg-sky-500/20 backdrop-blur-md border border-sky-500/30">
                            <MessageCircle className="w-4 h-4 fill-sky-400 text-sky-400" />
                          </div>
                          <span className="text-lg font-black tracking-tight drop-shadow-md">{post.totalComment || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-card border border-border overflow-hidden">
                  <Skeleton className="w-full h-full bg-muted animate-pulse" />
                </div>
              ))}
            </div>

            {!loading && posts.length === 0 && (
              <div className="text-center py-32 border-2 border-dashed border-border rounded-[40px] bg-card/50">
                <Images className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
                <p className="text-foreground text-xl font-medium tracking-tight">Bạn chưa có bài viết nào.</p>
                <p className="text-muted-foreground mt-2">Bắt đầu chia sẻ những khoảnh khắc của bạn.</p>
              </div>
            )}

            {posts.length < total && !loading && (
              <div className="flex justify-center pt-8">
                <Button 
                  variant="ghost" 
                  className="bg-card hover:bg-brand/10 text-brand hover:text-brand/70 rounded-2xl px-12 py-8 h-auto text-xl font-black border border-border hover:border-brand/30 transition-all duration-300"
                  onClick={() => setPage(p => p + 1)}
                >
                  Khám phá thêm
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Photos Tab (Showing images from posts) */}
        {activeTab === "Photos" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-16">
            {posts.map(post => 
              post.images.map((photo, imgIndex) => (
                <div
                  key={`${post.id}-${imgIndex}`}
                  onClick={() => setSelectedPost(post)}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-border hover:border-brand/50 transition-all duration-300"
                >
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Images className="w-6 h-6 text-white/70" />
                  </div>
                </div>
              ))
            )}
            {!loading && posts.every(p => p.images.length === 0) && (
              <div className="col-span-full text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border shadow-sm">
                <Images className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-20" />
                <p className="text-gray-500">Chưa có hình ảnh nào.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Detail Dialog - Swapped to PostCommentDialog */}
      {selectedPost && (
        <PostCommentDialog
          post={selectedPost}
          currentUser={user}
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          comments={comments}
          setComments={setComments}
          reactions={reactions}
          setReactions={setReactions}
          setTotalLike={setTotalLike}
          onReact={async (emoji) => {
            if (!user || !user.username) return;
            try {
              const data = await reactToPost(selectedPost.id, user.username, emoji);
              setReactions(data);
              setTotalLike(Object.values(data).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0));
            } catch (err) {
              console.error("Failed to react:", err);
            }
          }}
        />
      )}
    </div>
  );
}
