"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import GlobalPreloader from "@/components/GlobalPreloader";
import HeroVideoPreload from "@/components/HeroVideoPreload";
import UtmTracker from "@/components/UtmTracker";

const GridGuide = dynamic(() => import("@/components/GridGuide"), { ssr: false });
const LeadPopup = dynamic(() => import("@/components/LeadPopup"), { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), { ssr: false });

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [enhancementsReady, setEnhancementsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setEnhancementsReady(true), 3_000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (pathname.startsWith("/admin")) {
    return children;
  }

  return (
    <>
      {pathname === "/site-development" ? <GlobalPreloader /> : null}
      <Suspense fallback={null}>
        <UtmTracker />
        <AnalyticsTracker />
      </Suspense>
      {pathname === "/" ? <HeroVideoPreload /> : null}
      {enhancementsReady ? <SmoothScroll /> : null}
      <main className="swiss-grid gap-y-0">{children}</main>
      {enhancementsReady ? <LeadPopup /> : null}
      {process.env.NODE_ENV === "development" ? <GridGuide /> : null}
    </>
  );
}
