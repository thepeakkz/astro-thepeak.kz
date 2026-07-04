import type { Touchpoint, UtmAttribution } from "./utm";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function whatsappUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function formatCapturedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Qostanay",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function sameTouchpoint(first: Touchpoint, last: Touchpoint): boolean {
  return JSON.stringify(first) === JSON.stringify(last);
}

function touchpointLines(
  label: string,
  touchpoint: Touchpoint,
  deviceType?: UtmAttribution["deviceType"]
): string[] {
  return [
    `📊 ${label}: ${escapeHtml(touchpoint.source)}`,
    ...(deviceType ? [`• Тип: ${escapeHtml(deviceType)}`] : []),
    `• Время: ${escapeHtml(formatCapturedAt(touchpoint.capturedAt))}`,
    `• <a href="${escapeHtml(touchpoint.landingPage)}">Посадочная страница</a>`,
  ];
}

type LeadNotificationInput = {
  name: string;
  phone: string;
  form: string;
  comment: string;
  attribution: UtmAttribution | null;
};

export function formatTelegramLead(input: LeadNotificationInput): string {
  const phoneLink = whatsappUrl(input.phone);
  const phone = phoneLink
    ? `<a href="${phoneLink}">${escapeHtml(input.phone)}</a>`
    : escapeHtml(input.phone);
  const lines = [
    "📥 <b>Новая заявка</b>",
    `• Имя: ${escapeHtml(input.name)}`,
    `• Телефон: ${phone}`,
    `• Форма: ${escapeHtml(input.form)}`,
    `• Комментарий: ${escapeHtml(input.comment)}`,
  ];

  if (!input.attribution) return lines.join("\n");

  const { firstTouch, lastTouch, deviceType } = input.attribution;
  lines.push("");

  if (sameTouchpoint(firstTouch, lastTouch)) {
    lines.push(...touchpointLines("Источник", firstTouch, deviceType));
  } else {
    lines.push(...touchpointLines("Первый источник", firstTouch, deviceType));
    lines.push("", ...touchpointLines("Последний источник", lastTouch));
  }

  return lines.join("\n");
}
