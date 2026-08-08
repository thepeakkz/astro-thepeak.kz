import { NextRequest, NextResponse } from "next/server";
import { formatTelegramLead } from "@/lib/lead-notification";
import { parseUtmAttribution, UTM_COOKIE_NAME } from "@/lib/utm";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

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

    // 1. Prepare Telegram request promise
    const telegramPromise = fetch(url, {
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

    // 2. Prepare Supabase insert promise
    const supabasePromise = (async () => {
      if (!hasSupabaseEnv()) return;
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
        });
        if (error) {
          console.error("Supabase Lead Insert Error:", error);
        }
      } catch (err) {
        console.error("Failed to insert lead into Supabase:", err);
      }
    })();

    // 3. Execute requests concurrently
    const [telegramResponse] = await Promise.all([
      telegramPromise,
      supabasePromise,
    ]);

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text();
      console.error("Telegram API Error Response:", errorData);
      return NextResponse.json(
        { error: "Не удалось отправить сообщение в Telegram" },
        { status: 500 }
      );
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
