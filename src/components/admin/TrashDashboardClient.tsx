"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { restorePageAction, permanentDeletePageAction } from "@/app/admin/actions";
import type { CmsTrashPage } from "@/types/cms";
import { formatTypography } from "@/utils/typography";

export default function TrashDashboardClient({ initialPages }: { initialPages: CmsTrashPage[] }) {
  const [pages, setPages] = useState<CmsTrashPage[]>(initialPages);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleRestore(page: CmsTrashPage) {
    setMessage(null);
    startTransition(async () => {
      const res = await restorePageAction(page.id);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
        return;
      }
      setPages((current) => current.filter((p) => p.id !== page.id));
      setMessage({ type: "success", text: res.success || "Страница восстановлена." });
      router.refresh();
    });
  }

  function handlePermanentDelete(page: CmsTrashPage) {
    if (
      !window.confirm(
        `ВНИМАНИЕ! Вы действительно хотите безвозвратно удалить «${page.title}»? Это действие нельзя отменить.`,
      )
    ) {
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const res = await permanentDeletePageAction(page.id);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
        return;
      }
      setPages((current) => current.filter((p) => p.id !== page.id));
      setMessage({ type: "success", text: res.success || "Страница окончательно удалена." });
      router.refresh();
    });
  }

  return (
    <main className="peak-admin__main">
      {/* Навигация назад */}
      <div className="mb-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Все страницы</span>
        </Link>
      </div>

      {/* Заголовок страницы */}
      <div className="peak-admin__page-header">
        <div>
          <div className="peak-admin__breadcrumb">
            <span>CMS</span>
            <span>/</span>
            <span>Корзина</span>
          </div>
          <h1 className="peak-admin__page-title">Корзина</h1>
          <p className="peak-admin__page-meta">
            {pages.length > 0 ? `${pages.length} удалённых материалов` : "Корзина пуста"}
          </p>
        </div>
      </div>

      {/* Уведомление */}
      {message && (
        <div
          className={`peak-admin__notice ${
            message.type === "error" ? "peak-admin__notice--error" : "peak-admin__notice--success"
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
        </div>
      )}

      {pages.length === 0 ? (
        <div className="peak-admin__empty">
          <span className="peak-admin__empty-icon">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <p className="peak-admin__empty-title">Корзина пуста</p>
          <p className="peak-admin__empty-copy">
            Удалённые страницы и кейсы появятся здесь. Отсюда их всегда можно восстановить.
          </p>
        </div>
      ) : (
        <div className="peak-admin__table-card" role="list" aria-label="Удалённые страницы">
          <div className="divide-y divide-slate-100">
            {pages.map((page) => (
              <article
                key={page.id}
                role="listitem"
                className="peak-admin__table-row !cursor-default flex items-center justify-between p-4"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="peak-admin__badge peak-admin__badge--draft">
                      {page.page_kind === "case" ? "Кейс" : "Страница"}
                    </span>
                    <span className="text-xs text-slate-500">
                      Удалено:{" "}
                      {page.deleted_at
                        ? new Date(page.deleted_at).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 truncate">
                    {formatTypography(page.title)}
                  </h2>
                  <p className="text-xs font-mono text-slate-500 truncate mt-0.5">{page.slug}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleRestore(page)}
                    className="peak-admin__button peak-admin__button--outline !h-8 !text-xs"
                    title="Восстановить страницу"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    <span>Восстановить</span>
                  </button>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handlePermanentDelete(page)}
                    className="peak-admin__button peak-admin__button--danger !h-8 !text-xs"
                    title="Удалить навсегда"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    <span>Удалить навсегда</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
