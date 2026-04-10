"use client";

import { Sidebar } from "@/modules/shared/components/layout/sidebar";
import { Stories } from "../components/stories";
import PostCard from "../components/post-card";
import CreatePost from "../components/create-post";
import { TopChannels } from "../components/top-channels";
import { ChannelsSection } from "../components/channels-section";
import { SectionLeaderboard } from "../components/section-leaderboard";
import { useHomeFeed } from "../hooks/use-home-feed";
import { PostCardSkeleton } from "../components/post-card-skeleton";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/modules/shared/components/common/empty-state";

function HomePageV2() {
  const t = useTranslations("home");
  const { state } = useHomeFeed();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-[320px] p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-10 max-w-[1400px] mx-auto h-full">
          <div className="flex-1 flex justify-center min-w-0">
            <div className="w-full max-w-[940px] px-2 md:px-12 space-y-8">
              <Stories
                authors={state.contributors}
                isLoading={state.isLoadingContributors}
              />
              {state.isAuthenticated && <CreatePost />}

              <div className="space-y-6">
                {state.isLoadingPosts ? (
                  <>
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                  </>
                ) : state.posts.length > 0 ? (
                  state.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <EmptyState
                    icon="📭"
                    title={t("noPostsTitle")}
                    description={t("noPostsDesc")}
                    className="py-24"
                  />
                )}
              </div>
            </div>
          </div>

          <aside className="w-full max-w-[360px] sticky top-8 hidden lg:flex lg:flex-col gap-8 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide pb-20">
            <TopChannels />
            <ChannelsSection />
            <SectionLeaderboard />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default HomePageV2;
