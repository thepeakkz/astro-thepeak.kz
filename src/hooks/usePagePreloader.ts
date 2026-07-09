"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Cache for loaded blob URLs to ensure instant playback without network delays
export const preloadedCache: Record<string, string> = {};

// Keep track of whether initial load was already performed in this browser tab session
export let sessionInitialLoadDone = false;

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

    let active = true;
    let objectUrl: string | null = null;
    let urlToFetch: string | null = null;

    // Determine what to preload based on the current landing page path

    if (pathname === "/") {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (isMobile) {
        urlToFetch = "/bg-mobile-fast.mp4";
      } else {
        const video = document.createElement("video");
        const canPlayWebm =
          video.canPlayType('video/webm; codecs="vp9, vorbis"') ||
          video.canPlayType("video/webm");
        urlToFetch = canPlayWebm ? "/bg.webm" : "/bg.mp4";
      }
    } else if (pathname === "/site-development") {
      urlToFetch = "/site-development-hero.mp4";
    } else if (pathname === "/cases/ark") {
      urlToFetch = "/cases/ark.mp4";
    } else if (pathname === "/cases/avtopilot") {
      urlToFetch = "/cases/avtopilot.mp4";
    } else if (pathname === "/cases/bazisa") {
      urlToFetch = "/cases/bazis a.mp4";
    } else if (pathname === "/cases/lukoil") {
      urlToFetch = "/cases/lukoil.mp4";
    } else if (pathname === "/cases/racoon") {
      urlToFetch = "/cases/raccoon.mp4";
    } else if (pathname === "/cases/ris") {
      urlToFetch = "/cases/ris.mp4";
    }


    // If there is no specific media to preload for this page, simulate a smooth loading bar
    if (!urlToFetch) {
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
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("peak-preload-finished"));
          }
        } else {
          setProgress(Math.round(currentProgress));
        }
      }, intervalTime);

      return () => {
        active = false;
        clearInterval(timer);
      };
    }

    // If already preloaded, skip immediately
    if (preloadedCache[urlToFetch]) {
      setProgress(100);
      sessionInitialLoadDone = true;
      return;
    }

    // Fetch the cover video and calculate accurate download percentage
    const fetchMedia = async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const contentLengthHeader = response.headers.get("content-length");
        const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;


        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream reader not supported");

        let receivedLength = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            chunks.push(value);
            receivedLength += value.length;
            if (contentLength && active) {
              const pct = Math.round((receivedLength / contentLength) * 100);
              setProgress(Math.min(pct, 99));
            }
          }
        }

        if (!active) return;

        const mimeType = url.endsWith(".mp4") ? "video/mp4" : "video/webm";
        const blob = new Blob(chunks as unknown as BlobPart[], { type: mimeType });
        objectUrl = URL.createObjectURL(blob);
        preloadedCache[url] = objectUrl;


        setProgress(100);
        sessionInitialLoadDone = true;

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("peak-media-preloaded", {
              detail: { url, objectUrl },
            })
          );
          window.dispatchEvent(new CustomEvent("peak-preload-finished"));
        }
      } catch (error) {
        console.error("Failed to preload media:", error);
        if (active) {
          setProgress(100);
          sessionInitialLoadDone = true;
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("peak-preload-finished"));
          }
        }
      }
    };

    fetchMedia(urlToFetch);

    return () => {
      active = false;
    };
  }, [pathname]);

  return { progress, showPreloader, setShowPreloader };
}
