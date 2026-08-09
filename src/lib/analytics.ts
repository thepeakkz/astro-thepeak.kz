export const ANALYTICS_VISITOR_COOKIE = "thepeak_vid";
export const ANALYTICS_SESSION_COOKIE = "thepeak_sid";
export const ANALYTICS_VISITOR_MAX_AGE = 60 * 60 * 24 * 365;
export const ANALYTICS_SESSION_MAX_AGE = 60 * 30;

export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "section_view",
  "cta_click",
  "scroll_depth",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return typeof value === "string" &&
    ANALYTICS_EVENT_NAMES.includes(value as AnalyticsEventName);
}

export function trafficChannel(source: string, medium: string) {
  const normalized = `${source} ${medium}`.toLowerCase();

  if (!source || /прямой|direct/.test(normalized)) return "Прямые визиты (Direct)";
  if (/cpc|cpm|ppc|paid|ads|реклам|директ/.test(normalized)) return "Платная реклама (Paid Ads)";
  if (/instagram|facebook|meta|telegram|tiktok|linkedin|youtube|vk|social/.test(normalized)) {
    return "Соцсети и мессенджеры";
  }
  if (/google|yandex|bing|yahoo|duckduckgo|search|organic/.test(normalized)) {
    return "Поисковые системы (SEO)";
  }
  return "Другие источники";
}
