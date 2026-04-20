import { ProfilePage } from "@/modules/profile/pages";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Profile page of ${username}`,
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  return <ProfilePage username={username} />;
}
