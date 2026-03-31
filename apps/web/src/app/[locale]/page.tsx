"use client";

import { useEffect, useState } from "react";
import Stories from "@/components/home/stories/Stories";
import PostCard from "@/components/shared/PostCard";
import TrendingTopics from "@/components/home/trending_topics/TrendingTopics";
import ChannelList from "@/components/home/channels_list/ChannelList";
import TopAuthors from "@/components/home/top_author/TopAuthors";
import { Post } from "@/types/gallery";
import { fetchPosts } from "@/app/api/services/HomeService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { useTranslations } from "next-intl";

const LIMIT = 10;

function HomeContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channelId");
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const t = useTranslations("home");

  const fetchPostsData = async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const json = await fetchPosts(pageNum, LIMIT, channelId);
      
      if (pageNum === 1) {
        setPosts(json.data);
      } else {
        setPosts(prev => [...prev, ...json.data]);
      }
      setTotal(json.total);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPostsData(1, true);
  }, [channelId]);

  const handleLoadMore = () => {
    if (loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPostsData(nextPage);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 max-w-3xl mx-auto px-6 py-8">
        <Stories />
        <div className="mb-6 rounded-2xl bg-muted/30 backdrop-blur-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href={user?.username ? `/profile/${user.username}` : "/login"}>
              <img
                src={user?.avatar || "/assets/img/mezon-logo.webp"}
                alt="Your avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-brand/50 hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
            <CreatePostDialog
              authorId={user?.username || ""}
              onCreated={() => fetchPostsData(1, true)}
              className="flex-1"
              trigger={
                <div 
                  className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-muted-foreground hover:bg-muted/80 hover:border-brand/50 transition-all cursor-pointer"
                >
                  {t("what-is-on-your-mind")}
                </div>
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          {loading && posts.length === 0 ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
              <p className="text-gray-400">{t("loading-posts")}</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={user} />
              ))}
              
              {posts.length === 0 && !loading && (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-gray-400">{t("no-posts")}</p>
                </div>
              )}

              {posts.length < total && (
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="ghost" 
                    className="text-brand hover:text-brand/70 hover:bg-brand/10 rounded-xl px-8"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {loadingMore ? t("loading-more") : t("load-more")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="hidden xl:block w-80 px-6 py-8 space-y-6">
        <TrendingTopics />
        <ChannelList />
        <TopAuthors />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

