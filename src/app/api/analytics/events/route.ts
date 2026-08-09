import { NextRequest, NextResponse, userAgent } from "next/server";
import { isAnalyticsEventName, isUuid } from "@/lib/analytics";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Аналитика не настроена" }, { status: 503 });
  }

  const agent = userAgent(request);
  if (agent.isBot) return new NextResponse(null, { status: 204 });

  try {
    const body = await request.json();
    const eventId = body?.eventId;
    const visitorId = body?.visitorId;
    const sessionId = body?.sessionId;
    const eventName = body?.eventName;
    const pagePath = cleanString(body?.pagePath, 500);

    if (!isUuid(eventId) || !isUuid(visitorId) || !isUuid(sessionId) ||
        !isAnalyticsEventName(eventName) || !pagePath.startsWith("/")) {
      return NextResponse.json({ error: "Некорректное событие" }, { status: 400 });
    }

    const deviceType = agent.device.type === "mobile"
      ? "Мобильный"
      : agent.device.type === "tablet"
        ? "Планшет"
        : "Компьютер";
    const city = cleanString(request.headers.get("cf-ipcity") || request.headers.get("x-vercel-ip-city"), 160);
    const country = cleanString(request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country"), 160);
    const supabase = await createClient();
    const { error } = await supabase.from("analytics_events").insert({
      event_id: eventId,
      visitor_id: visitorId,
      session_id: sessionId,
      event_name: eventName,
      page_path: pagePath,
      page_title: cleanString(body?.pageTitle, 300),
      source: cleanString(body?.source, 300) || "Прямой заход",
      medium: cleanString(body?.medium, 300),
      campaign: cleanString(body?.campaign, 300),
      device_type: deviceType,
      city,
      country,
      metadata: cleanMetadata(body?.metadata),
    });

    if (error && error.code !== "23505") {
      console.error("Analytics event insert failed:", error.message);
      return NextResponse.json({ error: "Не удалось записать событие" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Некорректное событие" }, { status: 400 });
  }
}
