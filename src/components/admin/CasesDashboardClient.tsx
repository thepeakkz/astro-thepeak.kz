"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Eye,
  EyeOff,
  FolderOpen,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { createCaseAction, deletePageAction, togglePageStatusAction } from "@/app/admin/actions";
import type { CaseItem } from "@/data/cases";
import type { CmsPage } from "@/types/cms";
import { formatTypography } from "@/utils/typography";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CasesDashboardClient({
  initialAvailableCases,
  initialPages,
}: {
  initialAvailableCases?: CaseItem[];
  initialPages: CmsPage[];
}) {
  const [pages, setPages] = useState(initialPages);
  const [availableCases, setAvailableCases] = useState<CaseItem[]>(initialAvailableCases || []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (initialAvailableCases && initialAvailableCases.length > 0) return;
    const controller = new AbortController();
    fetch("/api/admin/cases-list", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { cases?: CaseItem[] };
        setAvailableCases(data.cases || []);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [initialAvailableCases]);

  const caseByHref = useMemo(() => {
    return new Map(availableCases.map((item) => [item.href, item]));
  }, [availableCases]);

  const filteredPages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return pages.filter((page) => {
      const matchQuery =
        !normalized ||
        page.title.toLowerCase().includes(normalized) ||
        page.route_path.toLowerCase().includes(normalized);
      const matchStatus =
        statusFilter === "all" ? true : page.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [pages, query, statusFilter]);

  function changeTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function submitNewCase(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await createCaseAction({ title, slug });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setCreating(false);
      setTitle("");
      setSlug("");
      setSlugEdited(false);
      if (result.id) router.push(`/admin/pages/${result.id}`);
      else router.refresh();
    });
  }

  function toggleStatus(page: CmsPage) {
    const nextStatus = page.status === "published" ? "draft" : "published";
    setPages((current) => current.map((item) => (item.id === page.id ? { ...item, status: nextStatus } : item)));
    startTransition(async () => {
      const result = await togglePageStatusAction(page.id, nextStatus);
      if (result.error) {
        setPages((current) => current.map((item) => (item.id === page.id ? { ...item, status: page.status } : item)));
        setMessage(result.error);
        return;
      }
      router.refresh();
    });
  }

  function removePage(page: CmsPage) {
    if (!window.confirm(`Переместить кейс «${page.title}» в корзину?`)) return;
    startTransition(async () => {
      const result = await deletePageAction(page.id);
      if (result.error) setMessage(result.error);
      else {
        setPages((current) => current.filter((item) => item.id !== page.id));
        router.refresh();
      }
    });
  }

  return (
    <main className="peak-admin__main">
      {/* Заголовок страницы в стиле Vercel — Light */}
      <div className="peak-admin__page-header">
        <div>
          <div className="peak-admin__breadcrumb">
            <span>CMS</span>
            <span>/</span>
            <span>Портфолио</span>
          </div>
          <h1 className="peak-admin__page-title">Кейсы</h1>
          <p className="peak-admin__page-meta">
            {formatTypography(`${pages.length} проектов в базе · Галереи и описания`)}
          </p>
        </div>

        <div className="peak-admin__page-header-actions">
          {/* Переключатель вида Grid / List */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Сетка"
              aria-label="Сетка"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Список"
              aria-label="Список"
            >
              <List className="size-3.5" />
            </button>
          </div>

          {/* Фильтр статусов */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 font-medium shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Все
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
              Опубликованы
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

          {/* Поиск */}
          <div className="peak-admin__search max-w-xs">
            <Search className="peak-admin__search-icon size-3.5" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти кейс…"
              className="peak-admin__input !h-8 !text-xs"
            />
          </div>

          {/* Кнопка создания */}
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="peak-admin__button peak-admin__button--primary shrink-0"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>Добавить кейс</span>
          </button>
        </div>
      </div>

      {/* Уведомление об ошибке */}
      {message && (
        <div role="status" className="peak-admin__notice peak-admin__notice--error">
          <span>{formatTypography(message)}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            className="ml-auto text-current opacity-70 hover:opacity-100"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
      )}

      {/* Содержимое (Сетка / Список) */}
      {filteredPages.length > 0 ? (
        <AnimatePresence mode="wait" initial={false}>
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              className="peak-admin__cases-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.15 }}
              role="list"
              aria-label="Карточки кейсов"
            >
              {filteredPages.map((page) => {
                const item = caseByHref.get(page.route_path);
                const preview = item?.poster || item?.image || item?.video;
                const isPublished = page.status === "published";

                return (
                  <article
                    key={page.id}
                    className="peak-admin__case-card group"
                    role="listitem"
                    onClick={() => router.push(`/admin/pages/${page.id}`)}
                  >
                    {/* Медиа превью */}
                    <div className="peak-admin__case-card-media bg-slate-100">
                      {preview ? (
                        /\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(preview) ? (
                          <video src={preview} muted playsInline preload="metadata" />
                        ) : (
                          <img src={preview} alt="" />
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center size-full text-slate-400">
                          <FolderOpen className="size-8 mb-1" />
                          <span className="text-xs">Нет обложки</span>
                        </div>
                      )}

                      {/* Бейдж статуса поверх картинки */}
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`peak-admin__badge ${
                            isPublished
                              ? "peak-admin__badge--published !bg-white/90 !border-slate-200 shadow-xs backdrop-blur-md"
                              : "peak-admin__badge--draft !bg-white/90 !border-slate-200 shadow-xs backdrop-blur-md"
                          }`}
                        >
                          <span>{isPublished ? "Опубликован" : "Черновик"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Футер карточки */}
                    <div className="peak-admin__case-card-body bg-white">
                      <div className="min-w-0 pr-2">
                        <h2 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 truncate">
                          {formatTypography(page.title)}
                        </h2>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item?.type ? formatTypography(item.type) : page.route_path}
                        </p>
                      </div>

                      {/* Действия с кейсом */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={pending}
                          title={isPublished ? "Снять с публикации" : "Опубликовать"}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleStatus(page);
                          }}
                          className="peak-admin__icon-button"
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
                            title="Открыть на сайте"
                            onClick={(event) => {
                              event.stopPropagation();
                              window.open(page.route_path, "_blank");
                            }}
                            className="peak-admin__icon-button"
                          >
                            <ExternalLink className="size-3.5 text-slate-500" />
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={pending}
                          title="Удалить кейс"
                          onClick={(event) => {
                            event.stopPropagation();
                            removePage(page);
                          }}
                          className="peak-admin__icon-button peak-admin__icon-button--danger"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="peak-admin__table-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-5 w-[50%]">Название кейса</th>
                      <th className="py-3.5 px-5 w-[35%]">Адрес</th>
                      <th className="py-3.5 px-5 w-[15%] text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredPages.map((page) => {
                      const isPublished = page.status === "published";
                      return (
                        <tr
                          key={page.id}
                          onClick={() => router.push(`/admin/pages/${page.id}`)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 shrink-0 transition-colors">
                                <FolderOpen className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h2 className="text-xs font-semibold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                                    {formatTypography(page.title)}
                                  </h2>
                                  <span
                                    className={`peak-admin__badge ${
                                      isPublished
                                        ? "peak-admin__badge--published"
                                        : "peak-admin__badge--draft"
                                    }`}
                                  >
                                    <span>{isPublished ? "Опубликован" : "Черновик"}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-5 font-mono text-xs text-slate-500 truncate">
                            {page.route_path}
                          </td>

                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={pending}
                                className="peak-admin__icon-button"
                                title={isPublished ? "Снять с публикации" : "Опубликовать"}
                                onClick={() => toggleStatus(page)}
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
                                  className="peak-admin__icon-button"
                                  title="Открыть на сайте"
                                  onClick={() => window.open(page.route_path, "_blank")}
                                >
                                  <ExternalLink className="size-3.5 text-slate-500" />
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={pending}
                                className="peak-admin__icon-button peak-admin__icon-button--danger"
                                title="В корзину"
                                onClick={() => removePage(page)}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="peak-admin__empty">
          <span className="peak-admin__empty-icon">
            <Search className="size-5" aria-hidden="true" />
          </span>
          <p className="peak-admin__empty-title">Кейсы не найдены</p>
          <p className="peak-admin__empty-copy">Попробуйте изменить поисковый запрос.</p>
        </div>
      )}

      {/* Модальное окно создания кейса в стиле Shadcn Dialog — Light */}
      <AnimatePresence>
        {creating && (
          <div className="peak-admin__modal-backdrop" role="presentation">
            <motion.form
              onSubmit={submitNewCase}
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-case-title"
              className="peak-admin__modal-card bg-white"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="peak-admin__modal-header">
                <div>
                  <h2 id="new-case-title" className="text-base font-semibold text-slate-900">
                    Новый кейс
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatTypography("Поля проекта и загрузчик медиа добавятся автоматически.")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setMessage("");
                  }}
                  aria-label="Закрыть"
                  className="peak-admin__icon-button"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <div className="peak-admin__modal-body space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Название проекта
                  </label>
                  <input
                    autoFocus
                    value={title}
                    onChange={(event) => changeTitle(event.target.value)}
                    required
                    maxLength={160}
                    className="peak-admin__input"
                    placeholder="Например, Puma Kazakhstan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Адрес кейса (URL Slug)
                  </label>
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-orange-500">
                    <span className="px-3 py-2 text-xs font-mono text-slate-500 bg-slate-100 border-r border-slate-200">
                      thepeak.kz/cases/
                    </span>
                    <input
                      value={slug}
                      onChange={(event) => {
                        setSlugEdited(true);
                        setSlug(slugify(event.target.value));
                      }}
                      required
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      className="flex-1 px-3 py-2 text-xs font-mono text-slate-900 bg-transparent border-0 outline-none"
                      placeholder="puma-kazakhstan"
                    />
                  </div>
                </div>

                {message && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
                    {formatTypography(message)}
                  </p>
                )}
              </div>

              <div className="peak-admin__modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setMessage("");
                  }}
                  className="peak-admin__button peak-admin__button--outline"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="peak-admin__button peak-admin__button--primary"
                >
                  {pending ? "Создаём…" : "Создать кейс"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
