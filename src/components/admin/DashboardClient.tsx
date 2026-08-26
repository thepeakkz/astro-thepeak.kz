"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Inbox,
  Search,
  Trash2,
  TrendingUp,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [pending, startTransition] = useTransition();
  const [publishAllPending, setPublishAllPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/analytics?period=7d", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        setAnalytics((await response.json()) as DashboardAnalytics);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const casePages = useMemo(() => pages.filter((page) => page.page_kind === "case"), [pages]);
  const sitePages = useMemo(() => pages.filter((page) => page.page_kind !== "case"), [pages]);
  const draftCount = useMemo(() => pages.filter((page) => page.status === "draft").length, [pages]);
  const recentPages = useMemo(
    () => [...pages].sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at)).slice(0, 6),
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
    {
      label: "Посетители за 7 дней",
      value: analytics?.totals.uniqueVisitors ?? "—",
      icon: Users,
      detail: weeklyGrowth === null ? "Сбор данных" : `${weeklyGrowth >= 0 ? "+" : ""}${weeklyGrowth}% к прошлой неделе`,
      trendPositive: weeklyGrowth !== null && weeklyGrowth >= 0,
    },
    {
      label: "Просмотры страниц",
      value: analytics?.totals.pageviews ?? "—",
      icon: Eye,
      detail: analytics?.liveSource === "supabase" ? "Статистика сайта" : "Сбор событий",
      trendPositive: true,
    },
    {
      label: "Новые заявки",
      value: analytics?.totals.leadsCount ?? "—",
      icon: Inbox,
      detail: "За последние 7 дней",
      trendPositive: true,
    },
    {
      label: "Конверсия (CR)",
      value: analytics?.totals.conversionRate ?? "—",
      icon: TrendingUp,
      detail: `${draftCount} в черновиках`,
      trendPositive: null,
    },
  ];

  const filteredPages = useMemo(() => {
    return sitePages.filter((page) => {
      const matchSearch =
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.route_path.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : page.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sitePages, searchQuery, statusFilter]);

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
        setMessage({ type: "success", text: result.success || "Все страницы успешно опубликованы." });
        router.refresh();
      }
    } finally {
      setPublishAllPending(false);
    }
  }

  function toggleStatus(page: CmsPage) {
    const nextStatus = page.status === "published" ? "draft" : "published";
    setPages((current) => current.map((item) => (item.id === page.id ? { ...item, status: nextStatus } : item)));
    startTransition(async () => {
      const result = await togglePageStatusAction(page.id, nextStatus);
      if (result.error) {
        setPages((current) => current.map((item) => (item.id === page.id ? { ...item, status: page.status } : item)));
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "success", text: result.success || "Статус страницы обновлён." });
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
      {/* Заголовок страницы */}
      <div className="peak-admin__page-header">
        <div>
          <div className="peak-admin__breadcrumb">
            <span>CMS</span>
            <span>/</span>
            <span>Дашборд</span>
          </div>
          <h1 className="peak-admin__page-title">Рабочий стол</h1>
          <p className="peak-admin__page-meta">
            {formatTypography("Управление страницами, кейсами и заявками")}
          </p>
        </div>

        <div className="peak-admin__page-header-actions">
          {draftCount > 0 && (
            <button
              type="button"
              onClick={() => void handlePublishAll()}
              disabled={publishAllPending || pending}
              className="peak-admin__button peak-admin__button--primary"
            >
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span>
                {publishAllPending ? "Публикация…" : `Опубликовать всё (${draftCount})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Уведомление о результате */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`peak-admin__notice ${
            message.type === "error"
              ? "peak-admin__notice--error"
              : "peak-admin__notice--success"
          }`}
          role="status"
        >
          <span>{formatTypography(message.text)}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-70 hover:opacity-100"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Сетка метрик */}
      <section className="peak-admin__stat-grid" aria-label="Метрики эффективности">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="peak-admin__stat-card">
              <div className="peak-admin__stat-header">
                <span className="peak-admin__stat-label">{formatTypography(metric.label)}</span>
                <div className="peak-admin__stat-icon-wrap">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
              </div>
              <div className="peak-admin__stat-value">{metric.value}</div>
              <div className="peak-admin__stat-detail">
                <span>{formatTypography(metric.detail)}</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Баннер перехода в кейсы */}
      <section className="mb-6">
        <Link
          href="/admin/cases"
          className="group flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 group-hover:bg-orange-100 transition-colors">
              <FolderOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                Кейсы и портфолио
              </h2>
              <p className="text-xs text-slate-500">
                {casePages.length} кейсов в базе
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
            <span>Перейти к кейсам</span>
            <ChevronRight className="size-4" />
          </div>
        </Link>
      </section>

      {/* Основной контент: Таблица страниц + Сайдбар активности */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Левая колонка (2/3): Таблица страниц */}
        <div className="lg:col-span-2 space-y-4">
          <div className="peak-admin__table-card">
            {/* Тулбар поиска и фильтров */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 border-b border-slate-200 bg-white">
              <div className="flex-1 max-w-sm">
                <div className="peak-admin__search">
                  <Search className="peak-admin__search-icon size-3.5" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск страниц..."
                    className="peak-admin__input !h-8 !text-xs"
                  />
                </div>
              </div>

              {/* Фильтр статусов в стиле Segmented Control */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    statusFilter === "all"
                      ? "bg-white text-slate-900 font-medium shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Все ({sitePages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("published")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    statusFilter === "published"
                      ? "bg-white text-slate-900 font-medium shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Опубликовано
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("draft")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    statusFilter === "draft"
                      ? "bg-white text-slate-900 font-medium shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Черновики
                </button>
              </div>
            </div>

            {/* Таблица страниц */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5 w-[50%]">Название страницы</th>
                    <th className="py-3.5 px-5 w-[35%]">Адрес</th>
                    <th className="py-3.5 px-5 w-[15%] text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-xs text-slate-500">
                        {searchQuery
                          ? `Ничего не найдено по запросу «${searchQuery}»`
                          : "Страниц пока нет"}
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((page) => {
                      const isPublished = page.status === "published";
                      return (
                        <tr
                          key={page.id}
                          onClick={() => router.push(`/admin/pages/${page.id}`)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Название + Статус */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-700 shrink-0 transition-colors">
                                <FileText className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-xs font-semibold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                                    {formatTypography(page.title)}
                                  </h3>
                                  <span
                                    className={`peak-admin__badge ${
                                      isPublished
                                        ? "peak-admin__badge--published"
                                        : "peak-admin__badge--draft"
                                    }`}
                                  >
                                    <span>{isPublished ? "Опубликована" : "Черновик"}</span>
                                  </span>
                                  {page.is_system && (
                                    <span className="peak-admin__badge peak-admin__badge--system">
                                      Системная
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Путь / URL */}
                          <td className="py-3.5 px-5 font-mono text-xs text-slate-500 truncate">
                            {page.route_path}
                          </td>

                          {/* Действия */}
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() => toggleStatus(page)}
                                className="peak-admin__icon-button"
                                title={isPublished ? "Снять с публикации" : "Опубликовать"}
                              >
                                {isPublished ? (
                                  <Eye className="size-3.5 text-emerald-600" />
                                ) : (
                                  <EyeOff className="size-3.5 text-slate-400" />
                                )}
                              </button>

                              {isPublished && (
                                <button
                                  type="button"
                                  onClick={() => window.open(page.route_path, "_blank")}
                                  className="peak-admin__icon-button"
                                  title="Открыть на сайте"
                                >
                                  <ExternalLink className="size-3.5 text-slate-500" />
                                </button>
                              )}

                              {!page.is_system && (
                                <button
                                  type="button"
                                  disabled={pending}
                                  onClick={() => removePage(page)}
                                  className="peak-admin__icon-button peak-admin__icon-button--danger"
                                  title="В корзину"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Правая колонка (1/3): История активности */}
        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
                <Clock className="size-3.5 text-slate-500" aria-hidden="true" />
                <span>Недавние изменения</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {recentPages.length}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/admin/pages/${page.id}`}
                  className="flex items-center justify-between py-2.5 hover:bg-slate-50 rounded-lg px-2 transition-colors group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-xs font-medium text-slate-800 group-hover:text-slate-950 truncate block">
                      {formatTypography(page.title)}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {formatUpdatedAt(page.updated_at)}
                    </p>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
