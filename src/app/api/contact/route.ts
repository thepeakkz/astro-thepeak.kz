import { NextRequest, NextResponse } from "next/server";
import { formatTelegramLead } from "@/lib/lead-notification";
import { parseUtmAttribution, UTM_COOKIE_NAME } from "@/lib/utm";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_VISITOR_COOKIE,
  isUuid,
} from "@/lib/analytics";

function parseComment(comment: unknown) {
  const rawComment = typeof comment === "string" ? comment.trim() : "";
  const contactMethodMatch = rawComment.match(/\n*\[Способ связи:\s*([^\]]+)\]\s*$/);
  const contactMethod = contactMethodMatch?.[1]?.trim() || "Не указан";
  const project = contactMethodMatch
    ? rawComment.slice(0, contactMethodMatch.index).trim()
    : rawComment;

  return {
    contactMethod,
    project: project || "Не указан",
  };
}

function formatContactMethod(contactMethod: string): string {
  return contactMethod.toLowerCase() === "whatsapp" ? "Whatsapp" : contactMethod;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, comment, source } = body;

    // Validate inputs
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Имя обязательно для заполнения" },
        { status: 400 }
      );
    }
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Телефон обязателен для заполнения" },
        { status: 400 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment variables");
      return NextResponse.json(
        { error: "Ошибка конфигурации сервера (переменные Telegram не настроены)" },
        { status: 500 }
      );
    }

    const { contactMethod, project } = parseComment(comment);
    const utmAttribution = parseUtmAttribution(request.cookies.get(UTM_COOKIE_NAME)?.value);
    const sourceText = source && typeof source === "string" ? source.trim() : "Не указан";

    const text = formatTelegramLead({
      name: name.trim(),
      phone: phone.trim(),
      form: sourceText,
      comment: project,
      attribution: utmAttribution,
    });

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const visitorCookie = request.cookies.get(ANALYTICS_VISITOR_COOKIE)?.value;
    const sessionCookie = request.cookies.get(ANALYTICS_SESSION_COOKIE)?.value;

    // The CRM is the source of truth. Store the lead before sending notifications.
    if (hasSupabaseEnv()) {
      try {
        const supabase = await createClient();
        const { error } = await supabase.from("leads").insert({
          name: name.trim(),
          phone: phone.trim(),
          source: sourceText,
          comment: project,
          contact_method: formatContactMethod(contactMethod),
          status: "new",
          attribution: utmAttribution ?? {},
          visitor_id: isUuid(visitorCookie) ? visitorCookie : null,
          session_id: isUuid(sessionCookie) ? sessionCookie : null,
        });
        if (error) throw error;
      } catch (error) {
        console.error("Failed to insert lead into Supabase:", error);
        return NextResponse.json(
          { error: "Не удалось сохранить заявку. Попробуйте ещё раз." },
          { status: 500 },
        );
      }
    }

    const telegramResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text();
      console.error("Telegram API Error Response:", errorData);
      // The lead is already safely stored in the CRM, so do not invite a retry
      // that would create a duplicate record.
      return NextResponse.json({ success: true, notificationWarning: true }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in contact API route:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
