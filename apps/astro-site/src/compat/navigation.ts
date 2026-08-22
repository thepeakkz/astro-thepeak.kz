import { useCallback, useEffect, useMemo, useState } from "react";

function currentUrl() {
  return typeof window === "undefined" ? new URL("https://www.thepeak.kz/") : new URL(window.location.href);
}

function useLocationUrl() {
  const [url, setUrl] = useState(currentUrl);

  useEffect(() => {
    const update = () => setUrl(currentUrl());
    window.addEventListener("popstate", update);
    document.addEventListener("astro:page-load", update);
    document.addEventListener("astro:after-swap", update);
    return () => {
      window.removeEventListener("popstate", update);
      document.removeEventListener("astro:page-load", update);
      document.removeEventListener("astro:after-swap", update);
    };
  }, []);

  return url;
}

export function usePathname() {
  return useLocationUrl().pathname;
}

export function useSearchParams() {
  const url = useLocationUrl();
  return useMemo(() => new URLSearchParams(url.search), [url.search]);
}

export function useRouter() {
  const navigate = useCallback((href: string, replace = false) => {
    if (replace) window.location.replace(href);
    else window.location.assign(href);
  }, []);

  return useMemo(() => ({
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    push: (href: string) => navigate(href),
    refresh: () => window.location.reload(),
    replace: (href: string) => navigate(href, true),
    prefetch: async () => undefined,
  }), [navigate]);
}

export function notFound(): never {
  throw new Error("ASTRO_NOT_FOUND");
}

export function redirect(href: string): never {
  if (typeof window !== "undefined") window.location.replace(href);
  throw new Error(`ASTRO_REDIRECT:${href}`);
}
