import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import AppChrome from "@/components/AppChrome";
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HCKHMPWG4L"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-HCKHMPWG4L');
          `}
        </Script>
        <Script id="google-engagement-event" strategy="afterInteractive">
          {`
              // Helper function to delay opening a URL until a gtag event is sent.
              // Call it in response to an action that should navigate to a URL.
              function gtagSendEvent(url) {
                var callback = function () {
                  if (typeof url === 'string') {
                    window.location = url;
                  }
                };
                gtag('event', 'user_engagement', {
                  'event_callback': callback,
                  'event_timeout': 2000,
                });
                return false;
              }

              function gtag_report_conversion(url) {
                return gtagSendEvent(url);
              }
          `}
        </Script>
        <JsonLd data={[getOrganizationJsonLd(), getWebsiteJsonLd()]} />
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '869063512449970');
            fbq('track', 'PageView');
          `}
        </Script>

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
