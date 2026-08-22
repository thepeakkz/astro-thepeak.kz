import type { APIRoute } from "astro";
import { isAnalyticsEventName, isUuid } from "@/lib/analytics";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const prerender = false;

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const metadata: Record<string, string | number | boolean> = {};
  for (const [key, item] of Object.entries(value).slice(0, 10)) {
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(key)) continue;
    if (typeof item === "string") metadata[key] = item.slice(0, 500);
    if (typeof item === "number" && Number.isFinite(item)) metadata[key] = item;
    if (typeof item === "boolean") metadata[key] = item;
  }
  return metadata;
}

export const POST: APIRoute = async ({ request }) => {
  if (!hasSupabaseEnv()) return Response.json({ error: "Аналитика не настроена" }, { status: 503 });
  const userAgent = request.headers.get("user-agent") || "";
  if (/bot|crawler|spider|crawling|headlesschrome|lighthouse/i.test(userAgent)) return new Response(null, { status: 204 });

  try {
    const body = await request.json();
    const pagePath = cleanString(body?.pagePath, 500);
    if (!isUuid(body?.eventId) || !isUuid(body?.visitorId) || !isUuid(body?.sessionId) ||
        !isAnalyticsEventName(body?.eventName) || !pagePath.startsWith("/")) {
      return Response.json({ error: "Некорректное событие" }, { status: 400 });
    }

    const deviceType = /ipad|tablet/i.test(userAgent)
      ? "Планшет"
      : /android|iphone|mobile/i.test(userAgent)
        ? "Мобильный"
        : "Компьютер";
    const { error } = await createPublicClient().from("analytics_events").insert({
      event_id: body.eventId,
      visitor_id: body.visitorId,
      session_id: body.sessionId,
      event_name: body.eventName,
      page_path: pagePath,
      page_title: cleanString(body?.pageTitle, 300),
      source: cleanString(body?.source, 300) || "Прямой заход",
      medium: cleanString(body?.medium, 300),
      campaign: cleanString(body?.campaign, 300),
      device_type: deviceType,
      city: cleanString(request.headers.get("cf-ipcity") || request.headers.get("x-vercel-ip-city"), 160),
      country: cleanString(request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country"), 160),
      metadata: cleanMetadata(body?.metadata),
    });
    if (error && error.code !== "23505") {
      console.error("Analytics event insert failed:", error.message);
      return Response.json({ error: "Не удалось записать событие" }, { status: 500 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Некорректное событие" }, { status: 400 });
  }
};
