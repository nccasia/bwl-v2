import { AppProviders } from "@/providers";
import type { Metadata } from "next";
import { MainLayout } from "@/modules/shared/components/layout/main-layout";
import { NextIntlClientProvider } from "next-intl";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteName = "BWL Social";
const siteDescription =
  "Nền tảng mạng xã hội nội bộ — khám phá bài viết, kênh và cộng đồng.";

export const metadata: Metadata = {
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider>
          <AppProviders>
            <MainLayout>{children}</MainLayout>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
