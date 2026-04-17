"use client";

import { useProfile } from "../hooks/use-profile";
import { Sidebar } from "@/modules/shared/components/layout/sidebar";
import {
  ProfileHeader,
  ProfileInfo,
  ProfileActions,
  ProfileNotFound,
  ProfileSkeleton,
  ProfileTabs,
} from "../components";

interface ProfilePageProps {
  username: string;
}

export function ProfilePage({ username }: ProfilePageProps) {
  const { profile, isLoading, isOwnProfile, isError } = useProfile(username);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-[320px] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {isLoading && !profile ? (
            <ProfileSkeleton />
          ) : isError ? (
            <ProfileNotFound username={username} />
          ) : (
            <div className="relative">
              <ProfileHeader
                profile={profile}
                username={username}
                isLoading={isLoading}
                isOwnProfile={isOwnProfile}
              />

              <ProfileActions
                isOwnProfile={isOwnProfile}
                isLoading={isLoading}
                isError={isError}
              />

              <ProfileInfo
                profile={profile}
                isOwnProfile={isOwnProfile}
                isLoading={isLoading}
              />
              <ProfileTabs authorId={profile?.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
