"use client";

import { useEffect } from "react";
import Lenis from "lenis";

const scrollDuration = 1.2;
const scrollEasing = (t: number) =>
  Math.min(1, 1.001 - Math.pow(2, -10 * t));

declare global {
  interface Window {
    peakLenis?: Lenis;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.0,
      easing: scrollEasing,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,
      stopInertiaOnNavigate: true,
    });

    window.peakLenis = lenis;

    // Create a ResizeObserver to update Lenis scroll bounds when body height changes
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });

    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const eventTarget = event.target;
      if (!(eventTarget instanceof Element)) {
        return;
      }

      const anchor = eventTarget.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSamePage =
        url.origin === currentUrl.origin &&
        url.pathname === currentUrl.pathname &&
        url.search === currentUrl.search;

      if (!isSamePage || !url.hash) {
        return;
      }

      const destination = document.getElementById(
        decodeURIComponent(url.hash.slice(1)),
      );
      if (!destination) {
        return;
      }

      event.preventDefault();

      if (currentUrl.hash !== url.hash) {
        window.history.pushState(null, "", url.hash);
      }

      window.requestAnimationFrame(() => {
        lenis.scrollTo(destination, {
          duration: scrollDuration,
          easing: scrollEasing,
        });
      });
    };
    
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });

      if (window.peakLenis === lenis) {
        delete window.peakLenis;
      }

      lenis.destroy();
      resizeObserver.disconnect();
    };
  }, []);

  return null;
}
