"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Eye, EyeOff, FolderOpen, LayoutGrid, List, Plus, Search, X } from "lucide-react";
import { createCaseAction, deletePageAction, togglePageStatusAction } from "@/app/admin/actions";
import type { CaseItem } from "@/data/cases";
import type { CmsPage } from "@/types/cms";
import { formatTypography } from "@/utils/typography";

function slugify(value: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
    щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  return value
    .toLowerCase()
    .split("")
    .map((character) => map[character] ?? character)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export default function CasesDashboardClient({ initialPages }: { initialPages: CmsPage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [caseCatalog, setCaseCatalog] = useState<CaseItem[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/cases-list", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json() as { cases?: CaseItem[] };
        setCaseCatalog(data.cases || []);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const caseByHref = useMemo(() => new Map(caseCatalog.map((item) => [item.href, item])), [caseCatalog]);

  const filteredPages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru");
    if (!normalizedQuery) return pages;

    return pages.filter((page) => (
      page.title.toLocaleLowerCase("ru").includes(normalizedQuery)
      || page.route_path.toLocaleLowerCase("ru").includes(normalizedQuery)
    ));
  }, [pages, query]);

  function changeTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function submitNewCase(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await createCaseAction({ title, slug });
      if (result.error || !result.id) {
        setMessage(result.error || "Не удалось создать кейс.");
        return;
      }
      router.push(`/admin/pages/${result.id}`);
    });
  }

  function toggleStatus(page: CmsPage) {
    const nextStatus = page.status === "published" ? "draft" : "published";

    setPages((current) => current.map((item) => (
      item.id === page.id ? { ...item, status: nextStatus } : item
    )));

    startTransition(async () => {
      const result = await togglePageStatusAction(page.id, nextStatus);
      if (result.error) {
        setPages((current) => current.map((item) => (
          item.id === page.id ? { ...item, status: page.status } : item
        )));
        setMessage(result.error);
        return;
      }
      router.refresh();
    });
  }

  function removePage(page: CmsPage) {
    if (!window.confirm(`Удалить кейс «${page.title}»? Это действие нельзя отменить.`)) return;
    setMessage("");
    startTransition(async () => {
      const result = await deletePageAction(page.id);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setPages((current) => current.filter((item) => item.id !== page.id));
      router.refresh();
    });
  }

  return (
    <main className="peak-admin__main">
      <div className="peak-admin__page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span className="peak-admin__featured-icon" style={{ width: "2rem", height: "2rem" }}>
            <FolderOpen className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="peak-admin__breadcrumb">CMS / Кейсы</p>
            <h1 className="peak-admin__page-title">Кейсы</h1>
            <p className="peak-admin__page-meta">{pages.length} проектов</p>
          </div>
        </div>
        <div className="peak-admin__page-header-actions">
          <div className="peak-admin__view-switcher" aria-label="Режим отображения">
            <button type="button" className={viewMode === "list" ? "is-active" : ""} onClick={() => setViewMode("list")} title="Список"><List className="size-4" /></button>
            <button type="button" className={viewMode === "grid" ? "is-active" : ""} onClick={() => setViewMode("grid")} title="Карточки"><LayoutGrid className="size-4" /></button>
          </div>
          <label className="peak-admin__search" style={{ maxWidth: "16rem" }}>
            <span className="sr-only">Поиск по кейсам</span>
            <Search className="peak-admin__search-icon size-4" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Найти кейс…"
              className="peak-admin__input"
            />
          </label>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="peak-admin__button peak-admin__button--primary shrink-0"
          >
            <Plus className="size-4" aria-hidden="true" />
            Добавить кейс
          </button>
        </div>
      </div>

      {message && (
        <div role="status" className="peak-admin__toast peak-admin__toast--error"><span>{formatTypography(message)}</span><button type="button" onClick={() => setMessage("")} aria-label="Закрыть уведомление">×</button></div>
      )}

      {filteredPages.length > 0 ? (
        <AnimatePresence mode="wait" initial={false}>
          {viewMode === "grid" ? (
            <motion.div key="grid" className="peak-admin__cases-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.15 }} role="list" aria-label="Карточки кейсов">
              {filteredPages.map((page) => {
                const item = caseByHref.get(page.route_path);
                const preview = item?.poster || item?.image || item?.video;
                return (
                  <article key={page.id} className="peak-admin__case-card" role="listitem" onClick={() => router.push(`/admin/pages/${page.id}`)}>
                    <div className="peak-admin__case-card-media">
                      {preview ? (/\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(preview) ? <video src={preview} muted playsInline preload="metadata" /> : <img src={preview} alt="" />) : <div className="peak-admin__case-card-placeholder"><FolderOpen className="size-6" /><span>Нет обложки</span></div>}
                      <span className={`peak-admin__case-card-status ${page.status === "published" ? "is-live" : ""}`}>{page.status === "published" ? "Опубликован" : "Черновик"}</span>
                    </div>
                    <div className="peak-admin__case-card-body">
                      <div><h2>{formatTypography(page.title)}</h2><p>{item?.type ? formatTypography(item.type) : page.route_path}</p></div>
                      <div className="peak-admin__case-card-actions">
                        <button type="button" disabled={pending} title={page.status === "published" ? "Снять с публикации" : "Опубликовать"} onClick={(event) => { event.stopPropagation(); toggleStatus(page); }}>{page.status === "published" ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
                        {page.status === "published" && <button type="button" title="Открыть на сайте" onClick={(event) => { event.stopPropagation(); window.open(page.route_path, "_blank"); }}><ExternalLink className="size-4" /></button>}
                        <button type="button" disabled={pending} title="Удалить кейс" onClick={(event) => { event.stopPropagation(); removePage(page); }}>×</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </motion.div>
          ) : (
            <motion.div key="list" className="peak-admin__hairline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="list" aria-label="Список кейсов">
              <div className="peak-admin__table-head peak-admin__table-head--pages"><div>Название кейса</div><div>Адрес страницы</div><div>Действия</div></div>
              {filteredPages.map((page) => (
                <article key={page.id} role="listitem" onClick={() => router.push(`/admin/pages/${page.id}`)} className="peak-admin__hairline-row peak-admin__page-row">
                  <div className="peak-admin__page-row-title"><h2 className="peak-admin__hairline-title">{formatTypography(page.title)}</h2>{page.status !== "published" && <span className="peak-admin__badge peak-admin__badge--warning">Черновик</span>}</div>
                  <span className="peak-admin__hairline-route">{page.route_path}</span>
                  <div className="peak-admin__hairline-actions"><button type="button" disabled={pending} className="peak-admin__icon-button" onClick={(event) => { event.stopPropagation(); toggleStatus(page); }}>{page.status === "published" ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>{page.status === "published" && <button type="button" className="peak-admin__icon-button" onClick={(event) => { event.stopPropagation(); window.open(page.route_path, "_blank"); }}><ExternalLink className="size-4" /></button>}<button type="button" disabled={pending} className="peak-admin__icon-button peak-admin__icon-button--danger" onClick={(event) => { event.stopPropagation(); removePage(page); }}>×</button></div>
                </article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="peak-admin__hairline">
          <div className="peak-admin__empty">
            <div>
              <span className="peak-admin__empty-icon">
                <Search className="size-5" aria-hidden="true" />
              </span>
              <p className="peak-admin__empty-title">Ничего не найдено</p>
              <p className="peak-admin__empty-copy">Попробуйте изменить запрос.</p>
            </div>
          </div>
        </div>
      )}

      {/* Модалка создания кейса */}
      {creating && (
        <div className="peak-admin__modal-backdrop" role="presentation">
          <form
            onSubmit={submitNewCase}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-case-title"
            className="peak-admin__modal"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="new-case-title" className="peak-admin__modal-title">Новый кейс</h2>
                <p className="peak-admin__modal-copy">
                  {formatTypography("Поля проекта и загрузчик обложки добавятся автоматически.")}
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
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <label className="peak-admin__field">
                <span className="peak-admin__label">Название проекта</span>
                <input
                  autoFocus
                  value={title}
                  onChange={(event) => changeTitle(event.target.value)}
                  required
                  maxLength={160}
                  className="peak-admin__input"
                  placeholder="Например, Puma Kazakhstan"
                />
              </label>
              <label className="peak-admin__field">
                <span className="peak-admin__label">Адрес кейса</span>
                <div className="peak-admin__url-field">
                  <span className="peak-admin__url-prefix">thepeak.kz/cases/</span>
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlugEdited(true);
                      setSlug(slugify(event.target.value));
                    }}
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    className="peak-admin__inline-input"
                    placeholder="puma-kazakhstan"
                  />
                </div>
              </label>
            </div>

            {message && <p className="peak-admin__notice peak-admin__notice--error">{formatTypography(message)}</p>}
            <button
              type="submit"
              disabled={pending}
              className="peak-admin__button peak-admin__button--primary mt-6 w-full"
            >
              {pending ? "Создаём…" : "Создать и заполнить"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
