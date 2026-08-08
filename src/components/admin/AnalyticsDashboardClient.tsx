"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Cloud,
  Eye,
  Filter,
  Globe,
  HardDrive,
  Image as ImageIcon,
  Laptop,
  Layers,
  Link2,
  LoaderCircle,
  MapPin,
  MessageSquareCheck,
  RefreshCw,
  Share2,
  Smartphone,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { formatTypography } from "@/utils/typography";

type DeepAnalyticsData = {
  period?: string;
  liveSource: "cloudflare" | "demo";
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
      used: number;
      limit: number;
      remaining: number;
      percent: number;
      plan: string;
    };
    r2: {
      storageUsed: string;
      storageLimit: string;
      storagePercent: number;
      classBUsed: string;
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
    <main className="peak-admin__main">
      {/* Навигация назад */}
      <Link href="/admin" className="peak-admin__back">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Назад в дашборд
      </Link>

      {/* Компактный заголовок страницы — без eyebrow, без hero */}
      <div className="peak-admin__page-header">
        <div>
          <h1 className="peak-admin__page-title">Аналитика</h1>
          <p className="peak-admin__page-meta">UTM-кампании · Воронки · География · Лимиты</p>
        </div>
        <div className="peak-admin__page-header-actions">
          <button
            type="button"
            onClick={() => void loadAnalytics(period)}
            disabled={loading}
            className="peak-admin__button peak-admin__button--outline"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Обновить
          </button>
        </div>
      </div>

      {/* Переключатель периода */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--peak-muted)" }}>
          Период:
        </span>
        <div className="peak-admin__period-switcher">
          {(["7d", "30d", "90d", "all"] as PeriodOption[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setPeriod(opt)}
              disabled={loading}
              className={`peak-admin__period-btn ${period === opt ? "peak-admin__period-btn--active" : ""}`}
            >
              {periodLabels[opt]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="peak-admin__notice peak-admin__notice--error">
          {formatTypography(error)}
        </p>
      )}

      {loading && !data ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "var(--peak-muted)" }}>
          <LoaderCircle
            style={{ width: "2rem", height: "2rem", margin: "0 auto", color: "var(--peak-coral)" }}
            className="animate-spin"
            aria-hidden="true"
          />
          <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>
            Загружаем аналитику за {periodLabels[period]}…
          </p>
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* 1. СИСТЕМНЫЕ ЛИМИТЫ */}
          <div className="peak-admin__analytics-section">
            <p className="peak-admin__analytics-label">
              <HardDrive className="size-3.5" aria-hidden="true" />
              Системные лимиты и квоты
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "var(--peak-line)" }}>
              {/* Tinify */}
              <div className="peak-admin__analytics-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ImageIcon className="size-4" style={{ color: "var(--peak-green)" }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--peak-ink)" }}>Tinify API</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--peak-muted)" }}>{data.systemLimits.tinify.plan}</div>
                    </div>
                  </div>
                  <span className={`peak-admin__badge ${data.systemLimits.tinify.percent > 85 ? "peak-admin__badge--danger" : "peak-admin__badge--success"}`}>
                    {data.systemLimits.tinify.percent}% использовано
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  <span style={{ color: "var(--peak-muted)" }}>Сжато в этом месяце</span>
                  <span style={{ color: "var(--peak-ink)" }}>{data.systemLimits.tinify.used} / {data.systemLimits.tinify.limit}</span>
                </div>
                <div className="peak-admin__progress-track">
                  <div
                    className={`peak-admin__progress-fill ${data.systemLimits.tinify.percent > 85 ? "" : "peak-admin__progress-fill--green"}`}
                    style={{ width: `${Math.max(data.systemLimits.tinify.percent, 3)}%` }}
                  />
                </div>
                <p style={{ fontSize: "0.6875rem", color: "var(--peak-muted)", marginTop: "0.375rem" }}>
                  Осталось: <strong style={{ color: "var(--peak-ink)" }}>{data.systemLimits.tinify.remaining}</strong> сжатий
                </p>
              </div>

              {/* Cloudflare R2 */}
              <div className="peak-admin__analytics-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Cloud className="size-4" style={{ color: "var(--peak-muted)" }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--peak-ink)" }}>Cloudflare R2</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--peak-muted)" }}>{data.systemLimits.r2.plan}</div>
                    </div>
                  </div>
                  <span className="peak-admin__badge peak-admin__badge--success">Норма</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  <span style={{ color: "var(--peak-muted)" }}>Занято места</span>
                  <span style={{ color: "var(--peak-ink)" }}>{data.systemLimits.r2.storageUsed} / {data.systemLimits.r2.storageLimit}</span>
                </div>
                <div className="peak-admin__progress-track">
                  <div
                    className="peak-admin__progress-fill peak-admin__progress-fill--ink"
                    style={{ width: `${Math.max(data.systemLimits.r2.storagePercent, 2)}%` }}
                  />
                </div>
                <p style={{ fontSize: "0.6875rem", color: "var(--peak-muted)", marginTop: "0.375rem" }}>
                  Чтений: <strong style={{ color: "var(--peak-ink)" }}>{data.systemLimits.r2.classBUsed}</strong> из {data.systemLimits.r2.classBLimit}
                </p>
              </div>
            </div>
          </div>

          {/* 2. КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ */}
          <div className="peak-admin__analytics-section">
            <p className="peak-admin__analytics-label">
              <BarChart3 className="size-3.5" aria-hidden="true" />
              Ключевые показатели за {periodLabels[period]}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1px", background: "var(--peak-line)" }}>
              <div className="peak-admin__analytics-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)" }}>Посетители</span>
                  <Users className="size-4" style={{ color: "var(--peak-coral)" }} aria-hidden="true" />
                </div>
                <p style={{ marginTop: "0.75rem", fontSize: "1.75rem", fontWeight: 900, color: "var(--peak-ink)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {data.totals.uniqueVisitors.toLocaleString()}
                </p>
                <p style={{ marginTop: "0.25rem", fontSize: "0.6875rem", color: "var(--peak-muted)" }}>Уникальные ({periodLabels[period]})</p>
              </div>

              <div className="peak-admin__analytics-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)" }}>Просмотры</span>
                  <Eye className="size-4" style={{ color: "var(--peak-muted)" }} aria-hidden="true" />
                </div>
                <p style={{ marginTop: "0.75rem", fontSize: "1.75rem", fontWeight: 900, color: "var(--peak-ink)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {data.totals.pageviews.toLocaleString()}
                </p>
                <p style={{ marginTop: "0.25rem", fontSize: "0.6875rem", color: "var(--peak-muted)" }}>Страниц и кейсов</p>
              </div>

              <div className="peak-admin__analytics-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)" }}>Заявки</span>
                  <MessageSquareCheck className="size-4" style={{ color: "var(--peak-green)" }} aria-hidden="true" />
                </div>
                <p style={{ marginTop: "0.75rem", fontSize: "1.75rem", fontWeight: 900, color: "var(--peak-ink)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {data.totals.leadsCount}
                </p>
                <p style={{ marginTop: "0.25rem", fontSize: "0.6875rem", color: "var(--peak-muted)" }}>Лидов получено</p>
              </div>

              <div className="peak-admin__analytics-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)" }}>Конверсия CR</span>
                  <BarChart3 className="size-4" style={{ color: "var(--peak-coral)" }} aria-hidden="true" />
                </div>
                <p style={{ marginTop: "0.75rem", fontSize: "1.75rem", fontWeight: 900, color: "var(--peak-coral)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {data.totals.conversionRate}
                </p>
                <p style={{ marginTop: "0.25rem", fontSize: "0.6875rem", color: "var(--peak-muted)" }}>Доля лидов от посещений</p>
              </div>
            </div>
          </div>

          {/* 3. UTM-КАМПАНИИ */}
          <div className="peak-admin__analytics-card peak-admin__analytics-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)" }}>
                  <Target className="size-4" style={{ color: "var(--peak-coral)" }} aria-hidden="true" />
                  UTM-кампании
                </div>
                <p style={{ fontSize: "0.6875rem", color: "var(--peak-muted)", marginTop: "0.125rem" }}>
                  Эффективность рекламных источников (utm_source &amp; utm_campaign)
                </p>
              </div>
              <span className="peak-admin__badge peak-admin__badge--neutral">{data.utmCampaigns.length} кампании</span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--peak-line)" }}>
                    <th style={{ paddingBottom: "0.5rem", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)" }}>Источник</th>
                    <th style={{ paddingBottom: "0.5rem", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)" }}>Кампания</th>
                    <th style={{ paddingBottom: "0.5rem", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)", textAlign: "center" }}>Визиты</th>
                    <th style={{ paddingBottom: "0.5rem", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)", textAlign: "center" }}>Лиды</th>
                    <th style={{ paddingBottom: "0.5rem", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)", textAlign: "right" }}>CR</th>
                  </tr>
                </thead>
                <tbody>
                  {data.utmCampaigns.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--peak-line)" }}>
                      <td style={{ padding: "0.5rem 0", fontWeight: 600, color: "var(--peak-ink)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                          <Link2 className="size-3.5" style={{ color: "var(--peak-muted)" }} />
                          {item.source}
                        </span>
                      </td>
                      <td style={{ padding: "0.5rem 0.5rem", fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", color: "var(--peak-muted)" }}>{item.campaign}</td>
                      <td style={{ padding: "0.5rem 0", textAlign: "center", fontWeight: 700, color: "var(--peak-ink)" }}>{item.visits}</td>
                      <td style={{ padding: "0.5rem 0", textAlign: "center" }}>
                        <span className={`peak-admin__badge ${item.leads > 0 ? "peak-admin__badge--success" : "peak-admin__badge--neutral"}`}>
                          {item.leads}
                        </span>
                      </td>
                      <td style={{ padding: "0.5rem 0", textAlign: "right", fontWeight: 700, color: "var(--peak-ink)" }}>{item.conversionRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. ГРАФИК ПОСЕЩАЕМОСТИ */}
          <div className="peak-admin__analytics-card peak-admin__analytics-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)" }}>Динамика посещаемости ({periodLabels[period]})</div>
                <p style={{ fontSize: "0.6875rem", color: "var(--peak-muted)", marginTop: "0.125rem" }}>Визиты и просмотры по дням</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.6875rem", fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--peak-coral)" }}>
                  <span style={{ display: "block", width: "0.5rem", height: "0.5rem", background: "var(--peak-coral)" }} />
                  Посетители
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--peak-muted)" }}>
                  <span style={{ display: "block", width: "0.5rem", height: "0.5rem", background: "var(--peak-muted)" }} />
                  Просмотры
                </span>
              </div>
            </div>

            <div style={{ position: "relative", height: "10rem", width: "100%", borderTop: "1px solid var(--peak-line)", paddingTop: "0.75rem", overflowX: "auto" }}>
              <div style={{ display: "flex", height: "100%", alignItems: "flex-end", justifyContent: "space-between", gap: "0.375rem", minWidth: "600px" }}>
                {data.dailyData.map((item, idx) => {
                  const visitHeight = item.visitors > 0 ? Math.min(Math.max(Math.round((item.visitors / maxVisitors) * 100), 8), 100) : 0;
                  const viewHeight = item.pageviews > 0 ? Math.min(Math.max(Math.round((item.pageviews / maxViews) * 100), 6), 100) : 0;

                  return (
                    <div key={idx} style={{ position: "relative", display: "flex", height: "100%", flex: 1, flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }} className="group">
                      <div style={{ display: "flex", width: "100%", maxWidth: "2.5rem", alignItems: "flex-end", justifyContent: "center", gap: "2px", height: "80%" }}>
                        <div style={{ width: "50%", background: "var(--peak-coral)", height: `${visitHeight}%` }} />
                        <div style={{ width: "50%", background: "var(--peak-muted)", opacity: 0.5, height: `${viewHeight}%` }} />
                      </div>
                      <span style={{ marginTop: "0.25rem", fontSize: "0.5625rem", fontWeight: 600, color: "var(--peak-muted)", flexShrink: 0 }}>{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. ВОРОНКА + СКРОЛЛ — с crosshair на воронке */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1px", background: "var(--peak-line)" }}>
            {/* Воронка микро-конверсий — crosshair-деталь #1 */}
            <div className="peak-admin__analytics-card peak-admin__crosshair">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)" }}>
                    <Filter className="size-4" style={{ color: "var(--peak-coral)" }} aria-hidden="true" />
                    Воронка микро-конверсий
                  </div>
                  <p style={{ fontSize: "0.6875rem", color: "var(--peak-muted)", marginTop: "0.125rem" }}>Движение посетителей к заявке</p>
                </div>
                <span className="peak-admin__badge peak-admin__badge--success">CR {data.totals.conversionRate}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data.microFunnel.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.25rem" }}>
                      <span>{item.step}</span>
                      <span style={{ fontWeight: 700 }}>{item.count} чел. ({item.percent}%)</span>
                    </div>
                    <div className="peak-admin__progress-track">
                      <div className="peak-admin__progress-fill" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Глубина скролла */}
            <div className="peak-admin__analytics-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.25rem" }}>
                <Layers className="size-4" style={{ color: "var(--peak-muted)" }} aria-hidden="true" />
                Глубина скролла
              </div>
              <p style={{ fontSize: "0.6875rem", color: "var(--peak-muted)", marginBottom: "0.75rem" }}>До какого блока прокручивают</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {data.scrollDepth.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.25rem" }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 700 }}>{item.percent}%</span>
                    </div>
                    <div className="peak-admin__progress-track">
                      <div className="peak-admin__progress-fill peak-admin__progress-fill--ink" style={{ width: `${item.percent}%`, opacity: 0.6 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. ТОП КЕЙСОВ + КОНВЕРСИЯ УСТРОЙСТВ — crosshair на топ кейсов */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1px", background: "var(--peak-line)" }}>
            {/* Топ кейсов — crosshair-деталь #2 */}
            <div className="peak-admin__analytics-card peak-admin__crosshair">
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.25rem" }}>
                <Trophy className="size-4" style={{ color: "var(--peak-coral)" }} aria-hidden="true" />
                Рейтинг конверсионных кейсов
              </div>
              <p style={{ fontSize: "0.6875rem", color: "var(--peak-muted)", marginBottom: "0.75rem" }}>Проекты, с которых чаще всего приходят заявки</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {data.topConvertingCases.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0.75rem",
                      background: "var(--peak-bg)",
                      borderLeft: idx === 0 ? "2px solid var(--peak-coral)" : "2px solid transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--peak-muted)", minWidth: "1.25rem" }}>#{idx + 1}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)" }}>{item.caseName}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "var(--peak-green)" }}>{item.leadsCount} лида</span>
                      <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--peak-muted)" }}>CR {item.conversionRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Конверсия по устройствам */}
            <div className="peak-admin__analytics-card">
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.25rem" }}>Конверсия по устройствам</div>
              <p style={{ fontSize: "0.6875rem", color: "var(--peak-muted)", marginBottom: "0.75rem" }}>Эффективность на ПК и смартфонах</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "var(--peak-bg)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--peak-muted)" }}>
                    <Laptop className="size-3.5" aria-hidden="true" />
                    ПК / Ноутбуки
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--peak-green)" }}>{data.deviceConversions.desktopCR}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "var(--peak-bg)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--peak-muted)" }}>
                    <Smartphone className="size-3.5" aria-hidden="true" />
                    Смартфоны
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--peak-coral)" }}>{data.deviceConversions.mobileCR}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "var(--peak-bg)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--peak-muted)" }}>
                    <Globe className="size-3.5" aria-hidden="true" />
                    Планшеты
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--peak-muted)" }}>{data.deviceConversions.tabletCR}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. ИСТОЧНИКИ + ГЕОГРАФИЯ */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--peak-line)" }}>
            {/* Источники трафика */}
            <div className="peak-admin__analytics-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.75rem" }}>
                <Share2 className="size-4" style={{ color: "var(--peak-muted)" }} aria-hidden="true" />
                Источники трафика
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {data.trafficChannels.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.25rem" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "0.5rem" }}>{item.channel}</span>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>{item.percent}%</span>
                    </div>
                    <div className="peak-admin__progress-track">
                      <div className="peak-admin__progress-fill" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* География */}
            <div className="peak-admin__analytics-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.75rem" }}>
                <MapPin className="size-4" style={{ color: "var(--peak-coral)" }} aria-hidden="true" />
                Топ городов
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {data.topCities.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, color: "var(--peak-ink)", marginBottom: "0.25rem" }}>
                      <span>{item.city}</span>
                      <span style={{ fontWeight: 700 }}>{item.percent}%</span>
                    </div>
                    <div className="peak-admin__progress-track">
                      <div className="peak-admin__progress-fill peak-admin__progress-fill--green" style={{ width: `${item.percent}%` }} />
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
