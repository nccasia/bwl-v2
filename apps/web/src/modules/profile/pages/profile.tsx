"use client";

import { useProfile } from "../hooks/use-profile";
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
    <main className="p-8 md:p-8">
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
            <ProfileTabs authorId={profile?.id ?? profile?.userId} />
          </div>
        )}
      </div>
    </main>
  );
}
