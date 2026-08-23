"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import GlobalPreloader from "@/components/GlobalPreloader";
import HeroVideoPreload from "@/components/HeroVideoPreload";
import UtmTracker from "@/components/UtmTracker";

import GridGuide from "@/components/GridGuide";
import LeadPopup from "@/components/LeadPopup";
import SmoothScroll from "@/components/SmoothScroll";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
      <SmoothScroll />
      <main className="swiss-grid gap-y-0">{children}</main>
      <LeadPopup />
      {process.env.NODE_ENV === "development" ? <GridGuide /> : null}
    </>
  );
}
