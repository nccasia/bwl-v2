import HomePageV2 from "@/modules/home-v2/page/home-page-v2";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function Home() {
  return <HomePageV2 />;
}
