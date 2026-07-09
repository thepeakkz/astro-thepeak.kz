"use client";

import type React from "react";
import type Lenis from "lenis";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type PendingTransition = {
  pathname: string;
  hash: string;
  resolve: () => void;
  timeoutId: number;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => Promise<void> | void) => {
    finished: Promise<void>;
  };
};

declare global {
  interface Window {
    peakLenis?: Lenis;
  }
}

type PageTransitionProps = {
  children: React.ReactNode;
};

const isPlainLeftClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const jumpToRouteStart = (hash: string) => {
  const html = document.documentElement;
  const previousScrollBehavior = html.style.scrollBehavior;

  html.style.scrollBehavior = "auto";

  if (hash) {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) {
      window.peakLenis?.scrollTo(target, { immediate: true, force: true, lock: true });
      target.scrollIntoView({ block: "start" });
    }
  } else {
    window.peakLenis?.scrollTo(0, { immediate: true, force: true, lock: true });
    window.scrollTo(0, 0);
  }

  window.peakLenis?.resize();
  html.style.scrollBehavior = previousScrollBehavior;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pendingTransition = useRef<PendingTransition | null>(null);
  const previousPathname = useRef(pathname);
  const pendingScrollY = useRef(0);
  const supportsNativeViewTransition = useRef(false);
  const [renderedChildren, setRenderedChildren] = useState(children);
  const [previousChildren, setPreviousChildren] = useState<React.ReactNode>(null);
  const [previousScrollY, setPreviousScrollY] = useState(0);
  const [isFallbackEntering, setIsFallbackEntering] = useState(false);
  const [isInitialHomeEntering, setIsInitialHomeEntering] = useState(false);

  useLayoutEffect(() => {
    const pending = pendingTransition.current;

    if (!pending || pending.pathname !== pathname) {
      if (previousPathname.current !== pathname) {
        jumpToRouteStart(window.location.hash);
      }

      return;
    }

    jumpToRouteStart(pending.hash);
    window.clearTimeout(pending.timeoutId);
    pending.resolve();
    pendingTransition.current = null;
  }, [pathname]);

  useEffect(() => {
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);

  useEffect(() => {
    supportsNativeViewTransition.current =
      typeof (document as ViewTransitionDocument).startViewTransition === "function";
  }, []);

  useEffect(() => {
    if (!isInitialHomeEntering) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsInitialHomeEntering(false);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [isInitialHomeEntering]);

  useEffect(() => {
    if (previousPathname.current === pathname) {
      setRenderedChildren(children);
      return;
    }

    if (supportsNativeViewTransition.current) {
      previousPathname.current = pathname;
      setRenderedChildren(children);
      return;
    }

    previousPathname.current = pathname;
    setPreviousChildren(renderedChildren);
    setPreviousScrollY(pendingScrollY.current);
    setRenderedChildren(children);
    setIsFallbackEntering(true);

    const timeoutId = window.setTimeout(() => {
      setPreviousChildren(null);
      setIsFallbackEntering(false);
    }, 1640);

    return () => window.clearTimeout(timeoutId);
  }, [children, pathname, renderedChildren]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !isPlainLeftClick(event)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href);
      const currentUrl = new URL(window.location.href);

      if (url.origin !== currentUrl.origin) {
        return;
      }

      const isSamePage = url.pathname === currentUrl.pathname && url.search === currentUrl.search;
      if (isSamePage) {
        return;
      }

      const viewTransitionDocument = document as ViewTransitionDocument;
      if (!viewTransitionDocument.startViewTransition) {
        return;
      }

      event.preventDefault();

      pendingTransition.current?.resolve();
      pendingScrollY.current = window.scrollY;
      const href = `${url.pathname}${url.search}${url.hash}`;

      viewTransitionDocument.startViewTransition(async () => {
        router.push(href);

        await new Promise<void>((resolve) => {
          const timeoutId = window.setTimeout(resolve, 1500);
          pendingTransition.current = {
            pathname: url.pathname,
            hash: url.hash,
            resolve,
            timeoutId,
          };
        });
      });
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      pendingTransition.current?.resolve();
      pendingTransition.current = null;
    };
  }, [router]);

  const currentChildren = supportsNativeViewTransition.current ? children : renderedChildren;

  return (
    <>
      {isInitialHomeEntering && <div className="page-transition-initial-bg" aria-hidden="true" />}
      {previousChildren && (
        <main
          className="swiss-grid gap-y-0 page-transition-previous"
          style={{ transform: `translateY(-${previousScrollY}px)` }}
          aria-hidden="true"
        >
          {previousChildren}
        </main>
      )}
      <main
        className={`swiss-grid gap-y-0 page-transition-current${isFallbackEntering ? " page-transition-fallback-enter" : ""}${isInitialHomeEntering ? " page-transition-initial-home" : ""}`}
        onAnimationEnd={(event) => {
          if (event.currentTarget === event.target && isInitialHomeEntering) {
            setIsInitialHomeEntering(false);
          }
        }}
      >
        {currentChildren}
      </main>
    </>
  );
}
