"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronRight, ExternalLink, Eye, EyeOff, FileText, FolderOpen, Plus, X } from "lucide-react";
import { createPageAction, deletePageAction, publishAllDraftsAction, togglePageStatusAction } from "@/app/admin/actions";
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

export default function DashboardClient({ initialPages }: { initialPages: CmsPage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const casePages = useMemo(() => pages.filter((page) => page.page_kind === "case"), [pages]);
  const sitePages = useMemo(() => pages.filter((page) => page.page_kind !== "case"), [pages]);
  const publishedCount = useMemo(
    () => sitePages.filter((page) => page.status === "published").length,
    [sitePages],
  );
  const draftCount = useMemo(
    () => pages.filter((page) => page.status === "draft").length,
    [pages],
  );
  const [publishAllPending, setPublishAllPending] = useState(false);

  async function handlePublishAll() {
    if (draftCount === 0) return;
    if (!window.confirm(`Опубликовать все ${draftCount} черновика${draftCount === 1 ? "" : draftCount < 5 ? "" : ""}? Они сразу станут видны на сайте.`)) return;
    setMessage(null);
    setPublishAllPending(true);
    try {
      const result = await publishAllDraftsAction();
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setPages((current) => current.map((p) => ({ ...p, status: "published" as const })));
        setMessage({ type: "success", text: result.success || "Все страницы опубликованы." });
        router.refresh();
      }
    } finally {
      setPublishAllPending(false);
    }
  }

  function changeTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function submitNewPage(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createPageAction({ title, slug });
      if (result.error || !result.id) {
        setMessage({ type: "error", text: result.error || "Не удалось создать страницу." });
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
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setPages((current) => current.filter((item) => item.id !== page.id));
      setMessage({ type: "success", text: result.success || "Страница перемещена в корзину." });
      router.refresh();
    });
  }

  return (
    <main className="peak-admin__main">
      {/* Компактный заголовок страницы — без eyebrow, без hero */}
      <div className="peak-admin__page-header">
        <div>
          <h1 className="peak-admin__page-title">Страницы сайта</h1>
        </div>
        <div className="peak-admin__page-header-actions">
          {draftCount > 0 && (
            <button
              type="button"
              onClick={() => void handlePublishAll()}
              disabled={publishAllPending || pending}
              className="peak-admin__button peak-admin__button--dark"
              title={`Опубликовать ${draftCount} черновика на сайте`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {publishAllPending ? "Публикуем…" : `Опубликовать всё (${draftCount})`}
            </button>
          )}
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="peak-admin__button peak-admin__button--primary"
          >
            <Plus className="size-4" aria-hidden="true" />
            Добавить
          </button>
        </div>
      </div>

      {/* Stat-bar — горизонтальная полоса с hairline-разделителями */}
      <div className="peak-admin__stat-bar" role="region" aria-label="Статистика">
        <div className="peak-admin__stat-cell">
          <span className="peak-admin__stat-value">{sitePages.length}</span>
          <span className="peak-admin__stat-label">Страниц</span>
        </div>
        <div className="peak-admin__stat-cell">
          <span className="peak-admin__stat-value">{casePages.length}</span>
          <span className="peak-admin__stat-label">Кейсов</span>
        </div>
        <div className="peak-admin__stat-cell">
          <span className="peak-admin__stat-value">{publishedCount}</span>
          <span className="peak-admin__stat-label">Опубликовано</span>
        </div>
        <div className="peak-admin__stat-cell">
          <span className="peak-admin__stat-value">—</span>
          <span className="peak-admin__stat-label">CR сайта</span>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={`peak-admin__notice ${message.type === "error" ? "peak-admin__notice--error" : "peak-admin__notice--success"}`}
        >
          {formatTypography(message.text)}
        </p>
      )}

      {/* Ссылка на кейсы — упрощённая, без coral-hero */}
      <Link
        href="/admin/cases"
        className="peak-admin__featured"
      >
        <span className="peak-admin__featured-icon">
          <FolderOpen className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="peak-admin__featured-title">Кейсы</span>
          <span className="peak-admin__featured-meta">{casePages.length} проектов в портфолио</span>
        </span>
        <ChevronRight className="peak-admin__featured-arrow size-4 shrink-0" aria-hidden="true" />
      </Link>

      {/* Заголовок секции */}
      <p className="peak-admin__section-title">Основные страницы</p>

      {/* Hairline-таблица страниц */}
      <div className="peak-admin__hairline" role="list" aria-label="Список страниц">
        {sitePages.length > 0 && (
          <div className="hidden sm:grid grid-cols-12 items-center gap-4 px-3.5 py-2.5 bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <div className="col-span-5">Название страницы</div>
            <div className="col-span-5">Адрес страницы</div>
            <div className="col-span-2 text-right">Действия</div>
          </div>
        )}

        {sitePages.length === 0 ? (
          <div className="peak-admin__empty">
            <div>
              <span className="peak-admin__empty-icon">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <h2 className="peak-admin__empty-title">Пока нет ни одной страницы</h2>
              <p className="peak-admin__empty-copy">Создайте первую — базовые блоки добавятся автоматически.</p>
            </div>
          </div>
        ) : (
          sitePages.map((page) => (
            <article
              key={page.id}
              role="listitem"
              onClick={() => router.push(`/admin/pages/${page.id}`)}
              className="peak-admin__hairline-row group grid grid-cols-12 items-center gap-4"
            >
              <div className="col-span-12 sm:col-span-5 flex items-center gap-2 min-w-0">
                <h2 className="peak-admin__hairline-title truncate">
                  {formatTypography(page.title)}
                </h2>
                {page.status !== "published" && (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200">
                    Черновик
                  </span>
                )}
              </div>

              <div className="col-span-12 sm:col-span-5 min-w-0">
                <span className="peak-admin__hairline-route truncate block font-mono text-xs text-slate-500">
                  {page.route_path}
                </span>
              </div>

              <div className="col-span-12 sm:col-span-2 peak-admin__hairline-actions justify-end">
                <button
                  type="button"
                  disabled={pending}
                  className="peak-admin__icon-button"
                  title={page.status === "published" ? "Снять с публикации" : "Опубликовать страницу"}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleStatus(page);
                  }}
                >
                  {page.status === "published" ? (
                    <Eye className="size-4" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-4" aria-hidden="true" />
                  )}
                </button>
                {page.status === "published" && (
                  <button
                    type="button"
                    className="peak-admin__icon-button"
                    title="Открыть страницу на сайте"
                    onClick={(event) => {
                      event.stopPropagation();
                      window.open(page.route_path, "_blank");
                    }}
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removePage(page);
                  }}
                  disabled={pending}
                  title="Удалить страницу"
                  aria-label={`Удалить страницу ${page.title}`}
                  className="peak-admin__icon-button peak-admin__icon-button--danger"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Модалка создания страницы */}
      {creating && (
        <div className="peak-admin__modal-backdrop" role="presentation">
          <form
            onSubmit={submitNewPage}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-page-title"
            className="peak-admin__modal"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="new-page-title" className="peak-admin__modal-title">Новая страница</h2>
                <p className="peak-admin__modal-copy">Заготовка с готовыми секциями появится автоматически.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreating(false)}
                aria-label="Закрыть"
                className="peak-admin__icon-button"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 space-y-5">
              <label className="peak-admin__field">
                <span className="peak-admin__label">Название</span>
                <input
                  autoFocus
                  value={title}
                  onChange={(event) => changeTitle(event.target.value)}
                  required
                  maxLength={160}
                  className="peak-admin__input"
                  placeholder="Например, Услуги брендинга"
                />
              </label>
              <label className="peak-admin__field">
                <span className="peak-admin__label">Адрес страницы</span>
                <div className="peak-admin__url-field">
                  <span className="peak-admin__url-prefix">thepeak.kz/</span>
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlugEdited(true);
                      setSlug(slugify(event.target.value));
                    }}
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    className="peak-admin__inline-input"
                    placeholder="branding"
                  />
                </div>
              </label>
            </div>
            {message?.type === "error" && <p className="peak-admin__notice peak-admin__notice--error">{formatTypography(message.text)}</p>}
            <button
              type="submit"
              disabled={pending}
              className="peak-admin__button peak-admin__button--primary mt-6 w-full"
            >
              {pending ? "Создаём…" : "Создать и редактировать"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
