"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Cloud,
  Eye,
  Image as ImageIcon,
  Layers,
  LoaderCircle,
  MessageSquareCheck,
  RefreshCw,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { formatTypography } from "@/utils/typography";

type DeepAnalyticsData = {
  period?: string;
  liveSource: "supabase" | "unavailable";
  sources: Record<"analytics" | "leads" | "r2" | "tinify", "live" | "unavailable">;
  warnings: string[];
  collectionStartedAt: string | null;
  totals: {
    uniqueVisitors: number;
    pageviews: number;
    leadsCount: number;
    conversionRate: string;
  };
  dailyData: Array<{ date: string; visitors: number; pageviews: number }>;
  topPages: Array<{ path: string; title: string; views: number; percent: number }>;
  devices: { desktop: number; mobile: number; tablet: number };
  deviceConversions: {
    desktopCR: string;
    mobileCR: string;
    tabletCR: string;
  };
  utmCampaigns: Array<{
    source: string;
    campaign: string;
    visits: number;
    leads: number;
    conversionRate: string;
  }>;
  microFunnel: Array<{ step: string; count: number; percent: number }>;
  scrollDepth: Array<{ label: string; percent: number }>;
  topConvertingCases: Array<{ caseName: string; leadsCount: number; conversionRate: string }>;
  trafficChannels: Array<{ channel: string; percent: number; color: string }>;
  topCities: Array<{ city: string; percent: number }>;
  systemLimits: {
    tinify: {
      used: number | null;
      limit: number;
      remaining: number | null;
      percent: number;
      plan: string;
    };
    r2: {
      storageUsed: string | null;
      storageLimit: string;
      storagePercent: number;
      objectCount: number | null;
      classBUsed: string | null;
      classBLimit: string;
      plan: string;
    };
  };
  updatedAt: string;
};

type PeriodOption = "7d" | "30d" | "90d" | "all";

export default function AnalyticsDashboardClient() {
  const [data, setData] = useState<DeepAnalyticsData | null>(null);
  const [period, setPeriod] = useState<PeriodOption>("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics(targetPeriod: PeriodOption = period) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/analytics?period=${targetPeriod}`);
      if (!response.ok) throw new Error("Не удалось загрузить данные аналитики.");
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при загрузке");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const maxViews = data?.dailyData ? Math.max(...data.dailyData.map((d) => d.pageviews), 1) : 1;
  const maxVisitors = data?.dailyData ? Math.max(...data.dailyData.map((d) => d.visitors), 1) : 1;

  const periodLabels: Record<PeriodOption, string> = {
    "7d": "7 дней",
    "30d": "30 дней",
    "90d": "90 дней",
    all: "Всё время",
  };

  return (
    <main className="peak-admin__main space-y-6">
      {/* Навигация назад */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Назад в дашборд</span>
        </Link>
      </div>

      {/* Заголовок страницы */}
      <div className="peak-admin__page-header">
        <div>
          <div className="peak-admin__breadcrumb">
            <span>CMS</span>
            <span>/</span>
            <span>Метрики</span>
          </div>
          <h1 className="peak-admin__page-title">Аналитика сайта</h1>
          <p className="peak-admin__page-meta">
            Трафик, конверсии, UTM-метки и использование системных квот
          </p>
        </div>

        <div className="peak-admin__page-header-actions">
          {/* Селектор периода */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
            {(["7d", "30d", "90d", "all"] as PeriodOption[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setPeriod(opt)}
                disabled={loading}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  period === opt
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {periodLabels[opt]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void loadAnalytics(period)}
            disabled={loading}
            className="peak-admin__button peak-admin__button--outline !h-9"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="peak-admin__notice peak-admin__notice--error">
          <span>{formatTypography(error)}</span>
        </div>
      )}

      {data?.warnings?.map((warning) => (
        <div key={warning} role="status" className="peak-admin__notice peak-admin__notice--warning">
          <span>{formatTypography(warning)}</span>
        </div>
      ))}

      {data?.sources.analytics === "live" && (
        <div className="peak-admin__notice peak-admin__notice--success">
          <span>
            {formatTypography(
              data.collectionStartedAt
                ? `Показываются реальные события сайта. Сбор начат ${new Date(data.collectionStartedAt).toLocaleDateString("ru-RU")}.`
                : "Сбор реальных событий сайта активен.",
            )}
          </span>
        </div>
      )}

      {loading && !data ? (
        <div className="py-20 text-center text-slate-500">
          <LoaderCircle className="size-8 animate-spin mx-auto text-orange-600 mb-3" />
          <p className="text-xs font-medium">Загрузка аналитики за {periodLabels[period]}…</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* 1. Системные лимиты */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Оптимизация изображений */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
                    <ImageIcon className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Оптимизация изображений</h3>
                    <p className="text-[11px] text-slate-500">Сжатие WebP</p>
                  </div>
                </div>
                <span className="peak-admin__badge peak-admin__badge--published">
                  <span>{data.systemLimits.tinify.percent}% квоты</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Сжато в этом месяце:</span>
                  <span className="text-slate-900 font-semibold">
                    {data.systemLimits.tinify.used ?? "—"} / {data.systemLimits.tinify.limit}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(data.systemLimits.tinify.percent, 3)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Осталось сжатий:{" "}
                  <strong className="text-slate-800 font-mono">
                    {data.systemLimits.tinify.remaining ?? "—"}
                  </strong>
                </p>
              </div>
            </div>

            {/* Хранилище медиафайлов */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
                    <Cloud className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Хранилище медиафайлов</h3>
                    <p className="text-[11px] text-slate-500">Медиатека и видео</p>
                  </div>
                </div>
                <span className="peak-admin__badge peak-admin__badge--published">
                  <span>Активно</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Объём хранилища:</span>
                  <span className="text-slate-900 font-semibold">
                    {data.systemLimits.r2.storageUsed ?? "< 1 GB"} / {data.systemLimits.r2.storageLimit}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(data.systemLimits.r2.storagePercent || 5, 5)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Файлов в медиатеке:{" "}
                  <strong className="text-slate-800 font-mono">
                    {data.systemLimits.r2.objectCount ?? "—"}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* 2. Основные KPI карточки */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="peak-admin__stat-card">
              <div className="peak-admin__stat-header">
                <span className="peak-admin__stat-label">Уникальные посетители</span>
                <div className="peak-admin__stat-icon-wrap"><Users className="size-4" /></div>
              </div>
              <div className="peak-admin__stat-value">{data.totals.uniqueVisitors}</div>
              <div className="peak-admin__stat-detail">За выбранный период</div>
            </div>

            <div className="peak-admin__stat-card">
              <div className="peak-admin__stat-header">
                <span className="peak-admin__stat-label">Просмотры страниц</span>
                <div className="peak-admin__stat-icon-wrap"><Eye className="size-4" /></div>
              </div>
              <div className="peak-admin__stat-value">{data.totals.pageviews}</div>
              <div className="peak-admin__stat-detail">Всего просмотров</div>
            </div>

            <div className="peak-admin__stat-card">
              <div className="peak-admin__stat-header">
                <span className="peak-admin__stat-label">Новые заявки</span>
                <div className="peak-admin__stat-icon-wrap"><MessageSquareCheck className="size-4" /></div>
              </div>
              <div className="peak-admin__stat-value">{data.totals.leadsCount}</div>
              <div className="peak-admin__stat-detail">Лиды в базе CRM</div>
            </div>

            <div className="peak-admin__stat-card">
              <div className="peak-admin__stat-header">
                <span className="peak-admin__stat-label">Конверсия (CR)</span>
                <div className="peak-admin__stat-icon-wrap"><Target className="size-4" /></div>
              </div>
              <div className="peak-admin__stat-value">{data.totals.conversionRate}</div>
              <div className="peak-admin__stat-detail">Посетители в заявки</div>
            </div>
          </div>

          {/* 3. График динамики посещений */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-orange-600" />
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Динамика трафика по дням
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="size-2 rounded-full bg-orange-500" />
                  Просмотры
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="size-2 rounded-full bg-slate-300" />
                  Посетители
                </span>
              </div>
            </div>

            {/* График в виде аккуратных столбцов */}
            <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5 items-end h-48 pt-6 pb-2">
              {data.dailyData.map((d, i) => {
                const viewHeight = Math.max(8, Math.round((d.pageviews / maxViews) * 100));
                const visitorHeight = Math.max(6, Math.round((d.visitors / maxVisitors) * 80));

                return (
                  <div
                    key={d.date || i}
                    className="flex flex-col items-center justify-end h-full gap-1 group relative"
                    title={`${d.date}: ${d.pageviews} просмотров, ${d.visitors} посетителей`}
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div
                        className="w-1/2 bg-orange-500/90 group-hover:bg-orange-600 rounded-t-sm transition-all"
                        style={{ height: `${viewHeight}%` }}
                      />
                      <div
                        className="w-1/2 bg-slate-300 group-hover:bg-slate-400 rounded-t-sm transition-all"
                        style={{ height: `${visitorHeight}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                      {d.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Популярные страницы и конверсионные кейсы */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Топ страниц */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                <Layers className="size-3.5 text-orange-600" />
                <span>Популярные страницы</span>
              </h3>
              <div className="space-y-2">
                {data.topPages.map((item) => (
                  <div key={item.path} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate pr-2">
                        {formatTypography(item.title || item.path)}
                      </span>
                      <span className="font-mono text-slate-500 shrink-0">
                        {item.views} ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Топ кейсов */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                <Trophy className="size-3.5 text-orange-600" />
                <span>Конверсии по кейсам</span>
              </h3>
              <div className="space-y-2">
                {data.topConvertingCases.map((item) => (
                  <div
                    key={item.caseName}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-800 truncate pr-2">
                      {formatTypography(item.caseName)}
                    </span>
                    <div className="flex items-center gap-3 shrink-0 font-mono">
                      <span className="text-slate-500">{item.leadsCount} лидов</span>
                      <span className="text-emerald-600 font-semibold">{item.conversionRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
