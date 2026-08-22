import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import AppChrome from "@/components/AppChrome";
import DeferredAnalyticsScripts from "@/components/DeferredAnalyticsScripts";
import { getOrganizationJsonLd, getWebsiteJsonLd, pageSeo, SITE_NAME, SITE_URL } from "@/lib/seo";

const interDisplay = localFont({
  src: [
    { path: "./fonts/InterDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InterDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/InterDisplay-SemiBold.woff2", weight: "600", style: "normal" },
    // Map heavier weights (700, 800, 900) to the SemiBold woff2 file
    { path: "./fonts/InterDisplay-SemiBold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/InterDisplay-SemiBold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/InterDisplay-SemiBold.woff2", weight: "900", style: "normal" },
  ],
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
    <html lang="ru" className={`${interDisplay.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <head />
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
