import type { APIRoute } from "astro";
import { formatTelegramLead } from "@/lib/lead-notification";
import { parseUtmAttribution, UTM_COOKIE_NAME } from "@/lib/utm";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ANALYTICS_SESSION_COOKIE, ANALYTICS_VISITOR_COOKIE, isUuid } from "@/lib/analytics";

export const prerender = false;

function parseCookies(header: string | null) {
  return new Map((header || "").split(";").flatMap((pair) => {
    const separator = pair.indexOf("=");
    if (separator < 0) return [];
    return [[pair.slice(0, separator).trim(), decodeURIComponent(pair.slice(separator + 1).trim())]];
  }));
}

function parseComment(comment: unknown) {
  const rawComment = typeof comment === "string" ? comment.trim() : "";
  const contactMethodMatch = rawComment.match(/\n*\[Способ связи:\s*([^\]]+)\]\s*$/);
  return {
    contactMethod: contactMethodMatch?.[1]?.trim() || "Не указан",
    project: (contactMethodMatch ? rawComment.slice(0, contactMethodMatch.index).trim() : rawComment) || "Не указан",
  };
}

function json(data: unknown, status: number) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const source = typeof body?.source === "string" ? body.source.trim() : "Не указан";
    if (!name) return json({ error: "Имя обязательно для заполнения" }, 400);
    if (!phone) return json({ error: "Телефон обязателен для заполнения" }, 400);

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return json({ error: "Ошибка конфигурации сервера (переменные Telegram не настроены)" }, 500);

    const cookies = parseCookies(request.headers.get("cookie"));
    const attribution = parseUtmAttribution(cookies.get(UTM_COOKIE_NAME));
    const { contactMethod, project } = parseComment(body?.comment);

    if (hasSupabaseEnv()) {
      const { error } = await createPublicClient().from("leads").insert({
        name,
        phone,
        source,
        comment: project,
        contact_method: contactMethod.toLowerCase() === "whatsapp" ? "Whatsapp" : contactMethod,
        status: "new",
        attribution: attribution ?? {},
        visitor_id: isUuid(cookies.get(ANALYTICS_VISITOR_COOKIE)) ? cookies.get(ANALYTICS_VISITOR_COOKIE) : null,
        session_id: isUuid(cookies.get(ANALYTICS_SESSION_COOKIE)) ? cookies.get(ANALYTICS_SESSION_COOKIE) : null,
      });
      if (error) {
        console.error("Failed to insert lead into Supabase:", error);
        return json({ error: "Не удалось сохранить заявку. Попробуйте ещё раз." }, 500);
      }
    }

    const text = formatTelegramLead({ name, phone, form: source, comment: project, attribution });
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
    });
    if (!telegramResponse.ok) {
      console.error("Telegram API Error Response:", await telegramResponse.text());
      return json({ success: true, notificationWarning: true }, 200);
    }
    return json({ success: true }, 200);
  } catch (error) {
    console.error("Error in Astro contact API route:", error);
    return json({ error: "Внутренняя ошибка сервера" }, 500);
  }
};
