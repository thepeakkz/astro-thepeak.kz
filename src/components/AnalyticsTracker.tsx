"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_MAX_AGE,
  ANALYTICS_VISITOR_COOKIE,
  ANALYTICS_VISITOR_MAX_AGE,
  type AnalyticsEventName,
  isUuid,
} from "@/lib/analytics";
import { createTouchpoint, parseUtmAttribution, UTM_COOKIE_NAME } from "@/lib/utm";

type EventMetadata = Record<string, string | number | boolean>;

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = [
    `${name}=${value}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "SameSite=Lax",
    window.location.protocol === "https:" ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

function analyticsIds() {
  const storedVisitor = readCookie(ANALYTICS_VISITOR_COOKIE);
  const storedSession = readCookie(ANALYTICS_SESSION_COOKIE);
  const visitorId = isUuid(storedVisitor) ? storedVisitor : crypto.randomUUID();
  const sessionId = isUuid(storedSession) ? storedSession : crypto.randomUUID();

  writeCookie(ANALYTICS_VISITOR_COOKIE, visitorId, ANALYTICS_VISITOR_MAX_AGE);
  writeCookie(ANALYTICS_SESSION_COOKIE, sessionId, ANALYTICS_SESSION_MAX_AGE);
  return { visitorId, sessionId };
}

function attributionForCurrentPage() {
  const cookieValue = readCookie(UTM_COOKIE_NAME);
  const attribution = parseUtmAttribution(cookieValue);
  if (attribution) return attribution.lastTouch;

  return createTouchpoint(
    new URLSearchParams(window.location.search),
    window.location.href,
    document.referrer,
  );
}

function sendEvent(eventName: AnalyticsEventName, pagePath: string, metadata: EventMetadata = {}) {
  const { visitorId, sessionId } = analyticsIds();
  const touchpoint = attributionForCurrentPage();
  const payload = JSON.stringify({
    eventId: crypto.randomUUID(),
    visitorId,
    sessionId,
    eventName,
    pagePath,
    pageTitle: document.title,
    source: touchpoint.source,
    medium: touchpoint.params.utm_medium || "",
    campaign: touchpoint.params.utm_campaign || "",
    metadata,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/events", new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const trackedPage = useRef("");

  useEffect(() => {
    const navigationKey = `${pathname}${query ? `?${query}` : ""}`;
    const pagePath = pathname;
    if (trackedPage.current === navigationKey) return;
    trackedPage.current = navigationKey;
    sendEvent("page_view", pagePath);

    const seenSections = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35 || seenSections.has(entry.target)) continue;
        seenSections.add(entry.target);
        const element = entry.target as HTMLElement;
        sendEvent("section_view", pagePath, {
          section: (element.id || element.getAttribute("aria-label") || "section").slice(0, 160),
        });
      }
    }, { threshold: [0.35] });

    document.querySelectorAll("main section, body > section").forEach((section) => observer.observe(section));

    const reached = new Set<number>();
    const trackScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      for (const threshold of [25, 50, 75, 100]) {
        if (percent >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          sendEvent("scroll_depth", pagePath, { threshold });
        }
      }
    };

    const trackClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a, button") : null;
      if (!target) return;
      const text = (target.textContent || target.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "";
      const explicitlyTracked = target.getAttribute("data-analytics-event") === "cta_click";
      if (!explicitlyTracked && !/обсуд|заяв|связат|рассчитать|начать проект|получить предлож/i.test(`${text} ${href}`)) return;
      sendEvent("cta_click", pagePath, { label: text.slice(0, 200), href: href.slice(0, 500) });
    };

    window.addEventListener("scroll", trackScroll, { passive: true });
    document.addEventListener("click", trackClick);
    trackScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", trackScroll);
      document.removeEventListener("click", trackClick);
    };
  }, [pathname, query]);

  return null;
}
