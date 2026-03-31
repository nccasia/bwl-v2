"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Post, BE_URL, Comment, Reactions } from "@/types/gallery";
import { PostCommentDialog } from "@/components/post/post_card/PostCommentDialog/PostCommentDialog";
import { useAuth } from "@/hooks/useAuth";
import { fetchPostsApi, fetchReactionsApi, sendReaction } from "@/app/api/download/Services/ExploreService";
import { calculateTotalLikes, filterPostsWithImages } from "@/utils/postUtils";

export default function Explore() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reactions>({});
  const [totalLike, setTotalLike] = useState(0);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const allPosts = await fetchPostsApi(BE_URL);

      const imagePosts = filterPostsWithImages(allPosts);

      const reactionPromises = imagePosts.map(p =>
        fetchReactionsApi(BE_URL, p.id)
      );

      const results = await Promise.all(reactionPromises);

      const updatedPosts = imagePosts.map((p, index) => {
        const reactions = results[index]?.data || results[index] || {};
        return {
          ...p,
          totalLike: calculateTotalLikes(reactions)
        };
      });

      setPosts(updatedPosts);

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const imageItems = posts.flatMap(post => 
    post.images.map((img, imgIndex) => ({
      id: `${post.id}-${imgIndex}`,
      image: img,
      post: post
    }))
  );

  return (
    <div className="min-h-screen">

      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for people"
              className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-4">
          <h2 className="text-foreground text-2xl mb-4">Discover</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-brand animate-spin" />
              <p className="text-muted-foreground/40 font-bold tracking-tight">Đang khám phá những điều mới mẻ...</p>
            </div>
          ) : imageItems.length === 0 ? (
            <div className="col-span-full py-32 text-center text-muted-foreground/20 font-bold text-xl">
              Không tìm thấy hình ảnh nào để khám phá
            </div>
          ) : (
            imageItems.map((item, index) => {
              const isLarge = index % 10 === 0;
              const isTall = index % 7 === 0 && !isLarge;
              const isWide = index % 8 === 0 && !isLarge && !isTall;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPost(item.post)}
                  className={`group relative rounded-[32px] overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-500 border border-border ${
                    isLarge
                      ? "col-span-2 row-span-2 h-[500px]"
                      : isTall
                      ? "row-span-2 h-[500px]"
                      : isWide
                      ? "col-span-2 h-[242px]"
                      : "h-[242px]"
                  }`}
                >
                  <img
                    src={item.image}
                    alt="Explore content"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <div className="flex items-center gap-5 px-5 py-3 rounded-2xl bg-background/10 backdrop-blur-md border border-border shadow-2xl">
                        <div className="flex items-center gap-2 text-foreground font-bold">
                          <span className="text-rose-400">❤️</span> {item.post.totalLike || 0}
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-2 text-foreground font-bold">
                          <span className="text-brand">💬</span> {item.post.totalComment || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-border group-hover:ring-brand/30 rounded-[32px] transition-all duration-500" />
                </div>
              );
            })
          )}
        </div>

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
              if (!user || !selectedPost) return;
              try {
                const data: Reactions = await sendReaction(selectedPost.id, user.username || "", emoji);
                setReactions(data);
                setTotalLike(Object.values(data).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0));
              } catch (err) {
                console.error("Failed to react:", err);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
