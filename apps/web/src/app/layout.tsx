import { AppProviders } from "@/providers";
import type { Metadata } from "next";
import { MainLayout } from "@/modules/shared/components/layout/main-layout";
import { NextIntlClientProvider } from "next-intl";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "BWL App", template: "%s | BWL App" },
  description: "BWL Application",
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
