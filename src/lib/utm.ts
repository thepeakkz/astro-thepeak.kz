export const UTM_COOKIE_NAME = "thepeak_utm";
export const UTM_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

const CLICK_ID_NAMES = new Set([
  "gclid",
  "dclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "yclid",
  "msclkid",
  "ttclid",
  "twclid",
  "li_fat_id",
  "epik",
  "scclid",
  "click_id",
]);
const MAX_VALUE_LENGTH = 300;
const MAX_PATH_LENGTH = 20;

export type Touchpoint = {
  source: string;
  params: Record<string, string>;
  clickIds: Record<string, string>;
  landingPage: string;
  capturedAt: string;
};

export type UtmAttribution = {
  firstTouch: Touchpoint;
  lastTouch: Touchpoint;
  deviceType: "Мобильный" | "Планшет" | "Компьютер";
  userPath: string[];
};

function collectParams(searchParams: URLSearchParams, matcher: (key: string) => boolean) {
  const result: Record<string, string> = {};

  for (const [rawKey, rawValue] of searchParams.entries()) {
    const key = rawKey.toLowerCase();
    if (matcher(key) && rawValue.trim()) {
      result[key] = rawValue.trim().slice(0, MAX_VALUE_LENGTH);
    }
  }

  return result;
}

function getSource(
  params: Record<string, string>,
  clickIds: Record<string, string>,
  referrer: string,
  landingPage: string
) {
  if (params.utm_source) return params.utm_source;
  if (clickIds.gclid || clickIds.dclid || clickIds.gbraid || clickIds.wbraid) return "Google Ads";
  if (clickIds.fbclid) return "Meta Ads";
  if (clickIds.yclid) return "Яндекс Директ";
  if (clickIds.msclkid) return "Microsoft Ads";
  if (clickIds.ttclid) return "TikTok Ads";
  if (clickIds.twclid) return "X Ads";
  if (clickIds.li_fat_id) return "LinkedIn Ads";

  if (referrer) {
    try {
      const referrerHost = new URL(referrer).hostname.replace(/^www\./, "");
      const landingHost = new URL(landingPage).hostname.replace(/^www\./, "");
      return referrerHost === landingHost ? "Прямой заход" : referrerHost;
    } catch {
      return referrer.slice(0, MAX_VALUE_LENGTH);
    }
  }

  return "Прямой заход";
}

export function getDeviceType(userAgent: string): UtmAttribution["deviceType"] {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(userAgent)) return "Планшет";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) return "Мобильный";
  return "Компьютер";
}

export function createTouchpoint(
  searchParams: URLSearchParams,
  landingPage: string,
  referrer: string,
  capturedAt = new Date().toISOString()
): Touchpoint {
  const params = collectParams(searchParams, (key) => /^utm_[a-z0-9_]+$/.test(key));
  const clickIds = collectParams(searchParams, (key) => CLICK_ID_NAMES.has(key));

  return {
    source: getSource(params, clickIds, referrer, landingPage),
    params,
    clickIds,
    landingPage: landingPage.slice(0, 1_000),
    capturedAt,
  };
}

export function updateAttribution(
  current: UtmAttribution | null,
  touchpoint: Touchpoint,
  deviceType: UtmAttribution["deviceType"],
  page: string,
  updateLastTouch: boolean
): UtmAttribution {
  const normalizedPage = page.slice(0, 300);
  const userPath = current?.userPath ?? [];
  const nextPath = userPath.at(-1) === normalizedPage
    ? userPath
    : [...userPath, normalizedPage].slice(-MAX_PATH_LENGTH);

  return {
    firstTouch: current?.firstTouch ?? touchpoint,
    lastTouch: current && !updateLastTouch ? current.lastTouch : touchpoint,
    deviceType,
    userPath: nextPath,
  };
}

export function serializeUtmAttribution(attribution: UtmAttribution): string {
  return encodeURIComponent(JSON.stringify(attribution));
}

function isTouchpoint(value: unknown): value is Touchpoint {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Touchpoint>;
  return (
    typeof item.source === "string" &&
    typeof item.landingPage === "string" &&
    typeof item.capturedAt === "string" &&
    !!item.params && typeof item.params === "object" &&
    !!item.clickIds && typeof item.clickIds === "object"
  );
}

export function parseUtmAttribution(value: string | undefined): UtmAttribution | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Partial<UtmAttribution>;
    if (
      !isTouchpoint(candidate.firstTouch) ||
      !isTouchpoint(candidate.lastTouch) ||
      !["Мобильный", "Планшет", "Компьютер"].includes(candidate.deviceType ?? "") ||
      !Array.isArray(candidate.userPath) ||
      !candidate.userPath.every((item) => typeof item === "string")
    ) {
      return null;
    }

    return candidate as UtmAttribution;
  } catch {
    return null;
  }
}
