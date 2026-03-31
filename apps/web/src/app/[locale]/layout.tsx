import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CustomColorProvider } from "@/components/theme/CustomColorProvider";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let messages;

  try {
    messages = (await import(`../../utils/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <CustomColorProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
            </NextIntlClientProvider>
          </CustomColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}