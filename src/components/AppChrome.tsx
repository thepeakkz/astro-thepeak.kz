"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import FormConversionTracker from "@/components/FormConversionTracker";
import GlobalPreloader from "@/components/GlobalPreloader";
import GridGuide from "@/components/GridGuide";
import HeroVideoPreload from "@/components/HeroVideoPreload";
import LeadPopup from "@/components/LeadPopup";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";
import UtmTracker from "@/components/UtmTracker";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return children;
  }

  return (
    <>
      <GlobalPreloader />
      <FormConversionTracker />
      <Suspense fallback={null}>
        <UtmTracker />
      </Suspense>
      <HeroVideoPreload />
      <SmoothScroll />
      <PageTransition>{children}</PageTransition>
      <LeadPopup />
      <GridGuide />
    </>
  );
}

