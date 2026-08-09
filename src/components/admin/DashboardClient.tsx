"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  MousePointerClick,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { deletePageAction, publishAllDraftsAction, togglePageStatusAction } from "@/app/admin/actions";
import type { CmsPage } from "@/types/cms";
import { formatTypography } from "@/utils/typography";

type DashboardAnalytics = {
  totals: {
    uniqueVisitors: number;
    pageviews: number;
    leadsCount: number;
    conversionRate: string;
  };
  dailyData: Array<{ date: string; visitors: number; pageviews: number }>;
  liveSource: "supabase" | "unavailable";
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? `сегодня, ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
    : date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function DashboardClient({ initialPages }: { initialPages: CmsPage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [publishAllPending, setPublishAllPending] = useState(false);
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/analytics?period=7d", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        setAnalytics(await response.json() as DashboardAnalytics);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const casePages = useMemo(() => pages.filter((page) => page.page_kind === "case"), [pages]);
  const sitePages = useMemo(() => pages.filter((page) => page.page_kind !== "case"), [pages]);
  const draftCount = useMemo(() => pages.filter((page) => page.status === "draft").length, [pages]);
  const recentPages = useMemo(
    () => [...pages].sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at)).slice(0, 5),
    [pages],
  );

  const weeklyGrowth = useMemo(() => {
    if (!analytics?.dailyData.length) return null;
    const midpoint = Math.max(1, Math.floor(analytics.dailyData.length / 2));
    const first = analytics.dailyData.slice(0, midpoint).reduce((sum, item) => sum + item.visitors, 0);
    const second = analytics.dailyData.slice(midpoint).reduce((sum, item) => sum + item.visitors, 0);
    if (first === 0) return null;
    return Math.round(((second - first) / first) * 100);
  }, [analytics]);

  const metrics = [
    { label: "Посетители за неделю", value: analytics?.totals.uniqueVisitors ?? "—", icon: Users, detail: weeklyGrowth === null ? "Собираем динамику" : `${weeklyGrowth >= 0 ? "+" : ""}${weeklyGrowth}% к началу периода` },
    { label: "Просмотры страниц", value: analytics?.totals.pageviews ?? "—", icon: MousePointerClick, detail: analytics?.liveSource === "supabase" ? "Реальные события сайта" : "Источник недоступен" },
    { label: "Новые заявки", value: analytics?.totals.leadsCount ?? "—", icon: Send, detail: "За последние 7 дней" },
    { label: "Конверсия", value: analytics?.totals.conversionRate ?? "—", icon: BarChart3, detail: `${draftCount} черновика требуют внимания` },
  ];

  async function handlePublishAll() {
    if (draftCount === 0) return;
    if (!window.confirm(`Опубликовать все черновики (${draftCount})? Они сразу станут видны на сайте.`)) return;
    setMessage(null);
    setPublishAllPending(true);
    try {
      const result = await publishAllDraftsAction();
      if (result.error) setMessage({ type: "error", text: result.error });
      else {
        setPages((current) => current.map((page) => ({ ...page, status: "published" as const })));
        setMessage({ type: "success", text: result.success || "Все страницы опубликованы." });
        router.refresh();
      }
    } finally {
      setPublishAllPending(false);
    }
  }

  function toggleStatus(page: CmsPage) {
    const nextStatus = page.status === "published" ? "draft" : "published";
    setPages((current) => current.map((item) => item.id === page.id ? { ...item, status: nextStatus } : item));
    startTransition(async () => {
      const result = await togglePageStatusAction(page.id, nextStatus);
      if (result.error) {
        setPages((current) => current.map((item) => item.id === page.id ? { ...item, status: page.status } : item));
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "success", text: result.success || "Статус обновлён." });
      router.refresh();
    });
  }

  function removePage(page: CmsPage) {
    if (!window.confirm(`Переместить страницу «${page.title}» в корзину?`)) return;
    setMessage(null);
    startTransition(async () => {
      const result = await deletePageAction(page.id);
      if (result.error) setMessage({ type: "error", text: result.error });
      else {
        setPages((current) => current.filter((item) => item.id !== page.id));
        setMessage({ type: "success", text: result.success || "Страница перемещена в корзину." });
        router.refresh();
      }
    });
  }

  return (
    <main className="peak-admin__main">
      <div className="peak-admin__page-header">
        <div>
          <p className="peak-admin__breadcrumb">CMS / Обзор</p>
          <h1 className="peak-admin__page-title">Рабочий стол</h1>
          <p className="peak-admin__page-meta">{formatTypography("Состояние сайта и последние изменения")}</p>
        </div>
        <div className="peak-admin__page-header-actions">
          <Link href="/admin/analytics" className="peak-admin__button peak-admin__button--outline">
            <BarChart3 className="size-4" aria-hidden="true" />
            Аналитика
          </Link>
          {draftCount > 0 && (
            <button type="button" onClick={() => void handlePublishAll()} disabled={publishAllPending || pending} className="peak-admin__button peak-admin__button--dark">
              <ArrowUpRight className="size-4" aria-hidden="true" />
              {publishAllPending ? "Публикуем…" : `Опубликовать всё (${draftCount})`}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div role="status" className={`peak-admin__toast ${message.type === "error" ? "peak-admin__toast--error" : "peak-admin__toast--success"}`}>
          <span>{formatTypography(message.text)}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="Закрыть уведомление">×</button>
        </div>
      )}

      <motion.section
        className="peak-admin__metric-grid"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } } }}
        aria-label="Метрики за неделю"
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.article key={metric.label} className={`peak-admin__metric-card ${index === 0 ? "peak-admin__crosshair" : ""}`} variants={{ hidden: { opacity: 0, y: reduceMotion ? 0 : 8 }, visible: { opacity: 1, y: 0 } }}>
              <div className="peak-admin__metric-card-head">
                <span>{formatTypography(metric.label)}</span>
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <strong>{metric.value}</strong>
              <small>{formatTypography(metric.detail)}</small>
            </motion.article>
          );
        })}
      </motion.section>

      <section className="peak-admin__dashboard-grid">
        <div>
          <div className="peak-admin__section-heading">
            <div>
              <h2>Контент сайта</h2>
              <p>{formatTypography(`${sitePages.length} страниц · ${casePages.length} кейсов`)}</p>
            </div>
          </div>
          <Link href="/admin/cases" className="peak-admin__featured">
            <span className="peak-admin__featured-icon"><FolderOpen className="size-5" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="peak-admin__featured-title">Кейсы</span>
              <span className="peak-admin__featured-meta">{formatTypography(`${casePages.length} проектов в портфолио`)}</span>
            </span>
            <ChevronRight className="peak-admin__featured-arrow size-4 shrink-0" aria-hidden="true" />
          </Link>

          <div className="peak-admin__hairline" role="list" aria-label="Список страниц">
            {sitePages.length > 0 && (
              <div className="peak-admin__table-head peak-admin__table-head--pages">
                <div>Название страницы</div><div>Адрес страницы</div><div>Действия</div>
              </div>
            )}
            {sitePages.length === 0 ? (
              <div className="peak-admin__empty"><div><span className="peak-admin__empty-icon"><FileText className="size-5" /></span><h2 className="peak-admin__empty-title">Пока нет страниц</h2></div></div>
            ) : sitePages.map((page) => (
              <article key={page.id} role="listitem" onClick={() => router.push(`/admin/pages/${page.id}`)} className="peak-admin__hairline-row peak-admin__page-row">
                <div className="peak-admin__page-row-title">
                  <h3 className="peak-admin__hairline-title">{formatTypography(page.title)}</h3>
                  {page.status !== "published" && <span className="peak-admin__badge peak-admin__badge--warning">Черновик</span>}
                </div>
                <span className="peak-admin__hairline-route">{page.route_path}</span>
                <div className="peak-admin__hairline-actions">
                  <button type="button" disabled={pending} className="peak-admin__icon-button" title={page.status === "published" ? "Снять с публикации" : "Опубликовать страницу"} onClick={(event) => { event.stopPropagation(); toggleStatus(page); }}>
                    {page.status === "published" ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  {page.status === "published" && <button type="button" className="peak-admin__icon-button" title="Открыть страницу" onClick={(event) => { event.stopPropagation(); window.open(page.route_path, "_blank"); }}><ExternalLink className="size-4" /></button>}
                  <button type="button" disabled={pending} className="peak-admin__icon-button peak-admin__icon-button--danger" title="Переместить в корзину" onClick={(event) => { event.stopPropagation(); removePage(page); }}><span aria-hidden="true">×</span></button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="peak-admin__activity">
          <div className="peak-admin__activity-head">
            <span><Sparkles className="size-4" aria-hidden="true" /> Последние изменения</span>
            <small>{recentPages.length}</small>
          </div>
          <div className="peak-admin__activity-list">
            {recentPages.map((page) => (
              <Link key={page.id} href={`/admin/pages/${page.id}`}>
                <span className={`peak-admin__activity-dot ${page.status === "published" ? "peak-admin__activity-dot--live" : ""}`} />
                <span><strong>{formatTypography(page.title)}</strong><small>{formatTypography(`${page.status === "published" ? "Опубликовано" : "Черновик"} · ${formatUpdatedAt(page.updated_at)}`)}</small></span>
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
