import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import AppChrome from "@/components/AppChrome";
import DeferredAnalyticsScripts from "@/components/DeferredAnalyticsScripts";
import { getOrganizationJsonLd, getWebsiteJsonLd, pageSeo, SITE_NAME, SITE_URL } from "@/lib/seo";

const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: pageSeo.home.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: pageSeo.home.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: pageSeo.home.title,
    description: pageSeo.home.description,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ru_KZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageSeo.home.title,
    description: pageSeo.home.description,
  },
  icons: {
    icon: "https://static.tildacdn.pro/tild3334-3763-4662-a232-663137633465/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${interTight.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
          media="print"
          // @ts-expect-error onLoad attribute for async stylesheet load
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
          />
        </noscript>
      </head>
      <body className="relative min-h-screen antialiased font-sans text-[#434343] bg-white selection:bg-[#FD4B32] selection:text-white overflow-x-clip">
        <DeferredAnalyticsScripts />
        <JsonLd data={[getOrganizationJsonLd(), getWebsiteJsonLd()]} />

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=869063512449970&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
