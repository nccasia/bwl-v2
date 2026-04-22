import { useProfilePost } from "../hooks/use-profile-post";
import PostCard from "@/modules/home-v2/components/post-card";
import { Spinner, Tabs } from "@heroui/react";
import { Post } from "@/types/home-v2";
import { ProfilePhotos } from ".";

interface ProfileTabsProps {
  authorId?: string;
}

export function ProfileTabs({ authorId }: ProfileTabsProps) {
  const { state } = useProfilePost(authorId ?? "");

  return (
    <Tabs>
      <Tabs.ListContainer>
        <Tabs.List aria-label="Profile navigation">
          <Tabs.Tab id="posts">
            Bài viết
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="photos">
            Ảnh
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel className="pt-4" id="posts">
        {state.isLoading ? (
          <div
            className="flex justify-center py-8"
            data-testid="spinner-container"
          >
            <Spinner />
          </div>
        ) : state.posts && state.posts.length > 0 ? (
          <div className="flex flex-col gap-6 pr-25 pl-25">
            {state.posts.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-content1/50 rounded-2xl border border-dashed border-divider">
            <p>Người dùng này chưa có bài viết nào.</p>
          </div>
        )}
      </Tabs.Panel>
      <Tabs.Panel className="pt-4" id="photos">
        {state.isLoading ? (
          <div
            className="flex justify-center py-8"
            data-testid="spinner-container"
          >
            <Spinner />
          </div>
        ) : (
          <ProfilePhotos images={state.allImages} />
        )}
      </Tabs.Panel>
    </Tabs>
  );
}
