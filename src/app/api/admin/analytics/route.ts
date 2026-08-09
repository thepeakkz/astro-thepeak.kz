import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { trafficChannel } from "@/lib/analytics";
import { createR2Client, getR2Config } from "@/lib/r2";
import { getAdminSession } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PeriodOption = "7d" | "30d" | "90d" | "all";
type Report = {
  totals?: { uniqueVisitors?: number; pageviews?: number; leadsCount?: number };
  dailyData?: Array<{ date: string; visitors: number; pageviews: number }>;
  topPages?: Array<{ path: string; title: string; views: number }>;
  deviceRows?: Array<{ deviceType: string; visitors: number; pageviews: number; leads: number }>;
  campaigns?: Array<{ source: string; medium: string; campaign: string; visits: number; leads: number }>;
  funnel?: { visits?: number; sections?: number; cta_clicks?: number };
  scrollRows?: Array<{ threshold: number; visitors: number }>;
  cases?: Array<{ page_path: string; title: string; visitors: number; leads: number }>;
  sources?: Array<{ source: string; visits: number }>;
  locations?: Array<{ location: string; visitors: number }>;
  collectionStartedAt?: string | null;
};

function dateInQostanay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Qostanay",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function subtractDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function percent(part: number, total: number, digits = 1) {
  return total > 0 ? Number(((part / total) * 100).toFixed(digits)) : 0;
}

function formatBytes(bytes: number) {
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} МБ`;
  return `${(bytes / 1_000_000_000).toFixed(2)} ГБ`;
}

async function getR2Usage() {
  const { bucket } = getR2Config();
  const client = createR2Client();
  let continuationToken: string | undefined;
  let bytes = 0;
  let objects = 0;

  do {
    const result = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    }));
    for (const object of result.Contents || []) {
      bytes += object.Size || 0;
      objects += 1;
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (continuationToken);

  return { bytes, objects };
}

async function getTinifyCompressionCount(apiKey: string) {
  const auth = Buffer.from(`api:${apiKey}`).toString("base64");
  const response = await fetch("https://api.tinify.com/shrink", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    // An empty validation request returns account headers without compressing an image.
    body: "{}",
    cache: "no-store",
  });
  const value = response.headers.get("compression-count");
  return value && /^\d+$/.test(value) ? Number(value) : null;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });

  const periodValue = request.nextUrl.searchParams.get("period") || "7d";
  if (!["7d", "30d", "90d", "all"].includes(periodValue)) {
    return NextResponse.json({ error: "Некорректный период" }, { status: 400 });
  }
  const period = periodValue as PeriodOption;
  const endDate = dateInQostanay();
  const startDate = subtractDays(endDate, period === "7d" ? 6 : period === "30d" ? 29 : period === "90d" ? 89 : 3650);
  const warnings: string[] = [];

  let report: Report = {};
  let analyticsStatus: "live" | "unavailable" = "live";
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("cms_analytics_report", {
      p_start: startDate,
      p_end: endDate,
    });
    if (error) throw error;
    report = (data || {}) as Report;
  } catch (error) {
    analyticsStatus = "unavailable";
    warnings.push("Сбор событий недоступен: проверьте, что миграция аналитики применена в Supabase.");
    console.error("Analytics report failed:", error);
  }

  const totals = {
    uniqueVisitors: report.totals?.uniqueVisitors || 0,
    pageviews: report.totals?.pageviews || 0,
    leadsCount: report.totals?.leadsCount || 0,
    conversionRate: `${percent(report.totals?.leadsCount || 0, report.totals?.uniqueVisitors || 0).toFixed(1)}%`,
  };

  const totalDeviceVisitors = (report.deviceRows || []).reduce((sum, item) => sum + item.visitors, 0);
  const byDevice = Object.fromEntries((report.deviceRows || []).map((item) => [item.deviceType, item]));
  const devices = {
    desktop: percent(byDevice["Компьютер"]?.visitors || 0, totalDeviceVisitors, 0),
    mobile: percent(byDevice["Мобильный"]?.visitors || 0, totalDeviceVisitors, 0),
    tablet: percent(byDevice["Планшет"]?.visitors || 0, totalDeviceVisitors, 0),
  };
  const deviceConversions = {
    desktopCR: `${percent(byDevice["Компьютер"]?.leads || 0, byDevice["Компьютер"]?.visitors || 0).toFixed(1)}%`,
    mobileCR: `${percent(byDevice["Мобильный"]?.leads || 0, byDevice["Мобильный"]?.visitors || 0).toFixed(1)}%`,
    tabletCR: `${percent(byDevice["Планшет"]?.leads || 0, byDevice["Планшет"]?.visitors || 0).toFixed(1)}%`,
  };

  const utmCampaigns = (report.campaigns || []).map((item) => ({
    source: [item.source, item.medium].filter(Boolean).join(" / "),
    campaign: item.campaign || "Без названия",
    visits: item.visits,
    leads: item.leads,
    conversionRate: `${percent(item.leads, item.visits).toFixed(1)}%`,
  }));

  const funnelVisits = report.funnel?.visits || 0;
  const microFunnel = [
    { step: "1. Визит на сайт", count: funnelVisits, percent: funnelVisits > 0 ? 100 : 0 },
    { step: "2. Просмотр содержимого", count: report.funnel?.sections || 0, percent: percent(report.funnel?.sections || 0, funnelVisits) },
    { step: "3. Нажатие CTA", count: report.funnel?.cta_clicks || 0, percent: percent(report.funnel?.cta_clicks || 0, funnelVisits) },
    { step: "4. Отправка формы заявки", count: totals.leadsCount, percent: percent(totals.leadsCount, funnelVisits) },
  ];
  const scrollMap = Object.fromEntries((report.scrollRows || []).map((item) => [item.threshold, item.visitors]));
  const scrollDepth = [25, 50, 75, 100].map((threshold) => ({
    label: `До ${threshold}% страницы`,
    percent: percent(scrollMap[threshold] || 0, funnelVisits),
  }));

  const topConvertingCases = (report.cases || []).map((item) => ({
    caseName: item.title,
    leadsCount: item.leads,
    conversionRate: `${percent(item.leads, item.visitors).toFixed(1)}%`,
  }));
  const channelCounts = new Map<string, number>();
  for (const item of report.sources || []) {
    const channel = trafficChannel(item.source, "");
    channelCounts.set(channel, (channelCounts.get(channel) || 0) + item.visits);
  }
  const totalChannelVisits = [...channelCounts.values()].reduce((sum, value) => sum + value, 0);
  const colors = ["bg-emerald-500", "bg-indigo-500", "bg-[#FD4B32]", "bg-sky-500", "bg-neutral-400"];
  const trafficChannels = [...channelCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([channel, visits], index) => ({ channel, percent: percent(visits, totalChannelVisits), color: colors[index % colors.length] }));
  const topCities = (report.locations || []).map((item) => ({
    city: item.location,
    percent: percent(item.visitors, totals.uniqueVisitors),
  }));

  let r2Status: "live" | "unavailable" = "live";
  let r2Usage = { bytes: 0, objects: 0 };
  try {
    r2Usage = await getR2Usage();
  } catch (error) {
    r2Status = "unavailable";
    warnings.push("Не удалось получить использование Cloudflare R2.");
    console.error("R2 usage failed:", error);
  }

  let tinifyStatus: "live" | "unavailable" = "unavailable";
  let tinifyUsed: number | null = null;
  if (process.env.TINIFY_API_KEY) {
    try {
      tinifyUsed = await getTinifyCompressionCount(process.env.TINIFY_API_KEY);
      tinifyStatus = tinifyUsed === null ? "unavailable" : "live";
    } catch (error) {
      console.error("Tinify usage failed:", error);
    }
  }
  if (tinifyStatus === "unavailable") warnings.push("Tinify не вернул текущий счётчик сжатий.");

  const topPages = (report.topPages || []).map((item) => ({
    ...item,
    percent: percent(item.views, totals.pageviews),
  }));

  return NextResponse.json({
    period,
    liveSource: analyticsStatus === "live" ? "supabase" : "unavailable",
    sources: {
      analytics: analyticsStatus,
      leads: analyticsStatus,
      r2: r2Status,
      tinify: tinifyStatus,
    },
    warnings,
    collectionStartedAt: report.collectionStartedAt || null,
    totals,
    dailyData: report.dailyData || [],
    topPages,
    devices,
    deviceConversions,
    utmCampaigns,
    microFunnel,
    scrollDepth,
    topConvertingCases,
    trafficChannels,
    topCities,
    systemLimits: {
      tinify: {
        used: tinifyUsed,
        limit: 500,
        remaining: tinifyUsed === null ? null : Math.max(500 - tinifyUsed, 0),
        percent: tinifyUsed === null ? 0 : Math.round((tinifyUsed / 500) * 100),
        plan: "Free Tier (500 сжатий/мес)",
      },
      r2: {
        storageUsed: r2Status === "live" ? formatBytes(r2Usage.bytes) : null,
        storageLimit: "10 ГБ",
        storagePercent: r2Status === "live" ? percent(r2Usage.bytes, 10_000_000_000) : 0,
        objectCount: r2Status === "live" ? r2Usage.objects : null,
        classBUsed: null,
        classBLimit: "10 млн",
        plan: "Free Tier (10 ГБ хранилища / 10 млн операций Class B)",
      },
    },
    updatedAt: new Date().toISOString(),
  });
}
