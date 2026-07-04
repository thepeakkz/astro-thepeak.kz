import { NextRequest, NextResponse } from "next/server";
import { formatTelegramLead } from "@/lib/lead-notification";
import { parseUtmAttribution, UTM_COOKIE_NAME } from "@/lib/utm";

// Helper function to escape HTML special characters for Telegram HTML mode
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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
    const trelloKey = process.env.TRELLO_API_KEY;
    const trelloToken = process.env.TRELLO_TOKEN;
    const trelloListId = process.env.TRELLO_LIST_ID;

    if (!token || !chatId) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment variables");
      return NextResponse.json(
        { error: "Ошибка конфигурации сервера (переменные Telegram не настроены)" },
        { status: 500 }
      );
    }
    if (!trelloKey || !trelloToken || !trelloListId) {
      console.error("Missing TRELLO_API_KEY, TRELLO_TOKEN or TRELLO_LIST_ID in environment variables");
      return NextResponse.json(
        { error: "Ошибка конфигурации сервера (переменные Trello не настроены)" },
        { status: 500 }
      );
    }

    const { contactMethod, project } = parseComment(comment);
    const utmAttribution = parseUtmAttribution(request.cookies.get(UTM_COOKIE_NAME)?.value);
    const sourceText = source && typeof source === "string" ? source.trim() : "Не указан";
    const formatTouchpoint = (
      label: string,
      touchpoint: NonNullable<typeof utmAttribution>["firstTouch"],
      escapeValues = true
    ) => {
      const safe = (value: string) => escapeValues ? escapeHtml(value) : value;
      return [
      `${label}: ${safe(touchpoint.source)}`,
      ...Object.entries(touchpoint.params).map(
        ([key, value]) => `${safe(key)}: ${safe(value)}`
      ),
      ...Object.entries(touchpoint.clickIds).map(
        ([key, value]) => `${safe(key)}: ${safe(value)}`
      ),
      `Посадочная: ${safe(touchpoint.landingPage)}`,
      `Время: ${safe(touchpoint.capturedAt)}`,
    ];
    };
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

    // 2. Prepare Trello request promise
    const trelloUrl = new URL("https://api.trello.com/1/cards");
    trelloUrl.searchParams.append("key", trelloKey);
    trelloUrl.searchParams.append("token", trelloToken);
    trelloUrl.searchParams.append("idList", trelloListId);

    const trelloDesc = [
      `Имя: ${name.trim()}`,
      `Телефон: ${phone.trim()}`,
      `Способ связи: ${formatContactMethod(contactMethod)}`,
      `Комментарий: ${project}`,
      `Источник: ${sourceText}`,
      ...(utmAttribution
        ? [
            "",
            ...formatTouchpoint("Первый источник", utmAttribution.firstTouch, false),
            "",
            ...formatTouchpoint("Последний источник", utmAttribution.lastTouch, false),
            `Устройство: ${utmAttribution.deviceType}`,
            `Путь: ${utmAttribution.userPath.join(" → ")}`,
          ]
        : [])
    ].join("\n");

    const trelloPromise = fetch(trelloUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Заявка от ${name.trim()}`,
        desc: trelloDesc,
        pos: "top",
      }),
    });

    // 3. Execute both requests concurrently, but await completion to keep serverless function active
    const [telegramResponse, trelloResponse] = await Promise.all([
      telegramPromise,
      trelloPromise
    ]);

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text();
      console.error("Telegram API Error Response:", errorData);
      return NextResponse.json(
        { error: "Не удалось отправить сообщение в Telegram" },
        { status: 500 }
      );
    }
    if (!trelloResponse.ok) {
      const errorData = await trelloResponse.text();
      console.error("Trello API Error Response:", errorData);
      return NextResponse.json(
        { error: "Не удалось создать карточку в Trello" },
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
