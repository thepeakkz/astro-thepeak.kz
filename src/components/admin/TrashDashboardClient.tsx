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
        `ВНИМАНИЕ! Вы действительно хотите безвозвратно удалить страницу «${page.title}»? Это действие нельзя отменить.`,
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
      <Link href="/admin" className="peak-admin__back">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Все страницы
      </Link>

      {/* Компактный заголовок страницы */}
      <div className="peak-admin__page-header">
        <div>
          <h1 className="peak-admin__page-title">Корзина</h1>
          <p className="peak-admin__page-meta">{pages.length > 0 ? `${pages.length} удалённых страниц` : "Пусто"}</p>
        </div>
      </div>

      {message && (
        <div
          className={`peak-admin__notice ${
            message.type === "error" ? "peak-admin__notice--error" : "peak-admin__notice--success"
          }`}
          role="status"
        >
          {message.text}
        </div>
      )}

      {pages.length === 0 ? (
        <div className="peak-admin__empty">
          <div>
            <span className="peak-admin__empty-icon">
              <Trash2 className="size-5" aria-hidden="true" />
            </span>
            <p className="peak-admin__empty-title">Корзина пуста</p>
            <p className="peak-admin__empty-copy">
              Удалённые страницы появятся здесь. Отсюда их всегда можно восстановить.
            </p>
          </div>
        </div>
      ) : (
        <div className="peak-admin__hairline" role="list" aria-label="Удалённые страницы">
          {pages.map((page) => (
            <article
              key={page.id}
              role="listitem"
              className="peak-admin__hairline-row"
              style={{ cursor: "default" }}
            >
              <div className="min-w-0 flex-1">
                <p className="peak-admin__hairline-status peak-admin__hairline-status--draft">
                  {page.page_kind === "case" ? "Кейс" : "Страница"} · удалено{" "}
                  {page.deleted_at
                    ? new Date(page.deleted_at).toLocaleDateString("ru-RU")
                    : "—"}
                </p>
                <h2 className="peak-admin__hairline-title truncate">
                  {formatTypography(page.title)}
                </h2>
                <p className="peak-admin__hairline-route truncate">{page.slug}</p>
              </div>
              <div className="peak-admin__hairline-actions">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleRestore(page)}
                  className="peak-admin__btn peak-admin__btn--secondary"
                  title="Восстановить страницу"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Восстановить
                </button>

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handlePermanentDelete(page)}
                  className="peak-admin__btn peak-admin__btn--danger"
                  title="Удалить навсегда"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Удалить навсегда
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
