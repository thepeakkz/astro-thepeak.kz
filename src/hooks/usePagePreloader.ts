"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Cache of page -> hero video URL. The consumer (e.g. SiteDevelopmentClient)
// sets this URL directly as the <video> src and lets the browser stream and
// buffer it natively, instead of downloading the whole file into memory
// as a blob before anything can play.
export const preloadedCache: Record<string, string> = {};

// Keep track of whether initial load was already performed in this browser tab session
export let sessionInitialLoadDone = false;

const PAGE_HERO_VIDEO: Record<string, string> = {
  "/site-development": "/site-development-hero.mp4",
};

export function usePagePreloader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(sessionInitialLoadDone ? 100 : 0);
  const [showPreloader, setShowPreloader] = useState(!sessionInitialLoadDone);

  useEffect(() => {
    if (sessionInitialLoadDone) {
      setProgress(100);
      setShowPreloader(false);
      return;
    }

    const urlToFetch = PAGE_HERO_VIDEO[pathname];
    if (urlToFetch && !preloadedCache[urlToFetch]) {
      preloadedCache[urlToFetch] = urlToFetch;
      window.dispatchEvent(
        new CustomEvent("peak-media-preloaded", {
          detail: { url: urlToFetch, objectUrl: urlToFetch },
        })
      );
    }

    // Simulate a smooth loading bar; the actual video streams in the
    // background via its own <video src> tag rather than blocking here.
    let active = true;
    let currentProgress = 0;
    const duration = 1200; // 1.2 seconds simulation
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      if (!active) return;
      currentProgress += step;
      if (currentProgress >= 100) {
        clearInterval(timer);
        setProgress(100);
        sessionInitialLoadDone = true;
        window.dispatchEvent(new CustomEvent("peak-preload-finished"));
      } else {
        setProgress(Math.round(currentProgress));
      }
    }, intervalTime);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [pathname]);

  return { progress, showPreloader, setShowPreloader };
}
