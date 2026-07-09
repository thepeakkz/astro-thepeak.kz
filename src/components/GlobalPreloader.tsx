"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Preloader from "./Preloader";
import { usePagePreloader } from "@/hooks/usePagePreloader";

export default function GlobalPreloader() {
  const { progress, showPreloader, setShowPreloader } = usePagePreloader();

  useEffect(() => {
    if (!showPreloader) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.peakLenis?.start();
      return;
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    let active = true;
    const stopScroll = () => {
      if (window.peakLenis) {
        window.peakLenis.stop();
      } else if (active) {
        requestAnimationFrame(stopScroll);
      }
    };
    stopScroll();

    return () => {
      active = false;
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.peakLenis?.start();
    };
  }, [showPreloader]);

  return (
    <AnimatePresence mode="wait">
      {showPreloader && (
        <Preloader
          progress={progress}
          onComplete={() => setShowPreloader(false)}
        />
      )}
    </AnimatePresence>
  );
}
