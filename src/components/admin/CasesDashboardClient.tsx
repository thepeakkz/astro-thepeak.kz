"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, ExternalLink, Eye, EyeOff, FolderOpen, Plus, Search, X } from "lucide-react";
import { createCaseAction, deletePageAction, togglePageStatusAction } from "@/app/admin/actions";
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
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

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
      {/* Навигация назад */}
      <Link href="/admin" className="peak-admin__back">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Все страницы
      </Link>

      {/* Компактный заголовок страницы */}
      <div className="peak-admin__page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span className="peak-admin__featured-icon" style={{ width: "2rem", height: "2rem" }}>
            <FolderOpen className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="peak-admin__page-title">Кейсы</h1>
            <p className="peak-admin__page-meta">{pages.length} проектов</p>
          </div>
        </div>
        <div className="peak-admin__page-header-actions">
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
        <p role="status" className="peak-admin__notice peak-admin__notice--error">
          {formatTypography(message)}
        </p>
      )}

      {/* Hairline-таблица кейсов */}
      <div className="peak-admin__hairline" role="list" aria-label="Список кейсов">
        {filteredPages.length > 0 && (
          <div className="hidden sm:grid grid-cols-12 items-center gap-4 px-3.5 py-2.5 bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <div className="col-span-5">Название кейса</div>
            <div className="col-span-5">Адрес страницы</div>
            <div className="col-span-2 text-right">Действия</div>
          </div>
        )}

        {filteredPages.length > 0 ? (
          filteredPages.map((page) => (
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
                  title={page.status === "published" ? "Снять с публикации" : "Опубликовать кейс"}
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
                  title="Удалить кейс"
                  aria-label={`Удалить кейс ${page.title}`}
                  className="peak-admin__icon-button peak-admin__icon-button--danger"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="peak-admin__empty">
            <div>
              <span className="peak-admin__empty-icon">
                <Search className="size-5" aria-hidden="true" />
              </span>
              <p className="peak-admin__empty-title">Ничего не найдено</p>
              <p className="peak-admin__empty-copy">Попробуйте изменить запрос.</p>
            </div>
          </div>
        )}
      </div>

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
                  Поля проекта и загрузчик обложки добавятся автоматически.
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
