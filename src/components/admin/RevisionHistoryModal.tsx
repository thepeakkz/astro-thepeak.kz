"use client";

import { useEffect, useState, useTransition } from "react";
import { History, RotateCcw, X, Clock, Layers } from "lucide-react";
import { getPageRevisionsAction } from "@/app/admin/actions";
import type { CmsPageRevision } from "@/types/cms";
import { formatTypography } from "@/utils/typography";

export default function RevisionHistoryModal({
  isOpen,
  onClose,
  pageId,
  onRestoreRevision,
}: {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  onRestoreRevision: (revision: CmsPageRevision) => void;
}) {
  const [revisions, setRevisions] = useState<CmsPageRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRevision, setSelectedRevision] = useState<CmsPageRevision | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen && pageId) {
      setLoading(true);
      startTransition(async () => {
        const res = await getPageRevisionsAction(pageId);
        setRevisions((res.revisions || []) as CmsPageRevision[]);
        setLoading(false);
      });
    }
  }, [isOpen, pageId]);

  if (!isOpen) return null;

  return (
    <div className="peak-admin__modal-backdrop" onClick={onClose}>
      <div
        className="peak-admin__modal-container peak-admin__modal-container--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="peak-admin__modal-header">
          <div className="flex items-center gap-2">
            <History className="size-5 text-[rgb(var(--admin-accent-rgb))]" aria-hidden="true" />
            <h2 className="peak-admin__modal-title">История версий страницы</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="peak-admin__icon-btn"
            title="Закрыть"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="peak-admin__modal-body flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 border-r border-[rgba(255,255,255,0.08)] pr-0 md:pr-6 max-h-[450px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="p-4 text-center text-sm opacity-60">Загрузка истории...</div>
            ) : revisions.length === 0 ? (
              <div className="p-4 text-center text-sm opacity-60">
                История версий пока пуста. При сохранении страницы здесь будут появляться сохранённые снимки.
              </div>
            ) : (
              revisions.map((rev, idx) => (
                <button
                  key={rev.id}
                  type="button"
                  onClick={() => setSelectedRevision(rev)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1 ${
                    selectedRevision?.id === rev.id
                      ? "border-[rgb(var(--admin-accent-rgb))] bg-[rgba(var(--admin-accent-rgb),0.1)]"
                      : "border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(255,255,255,0.1)] text-white">
                      {idx === 0 ? "Текущая версия" : `Версия #${revisions.length - idx}`}
                    </span>
                    <span className="text-xs opacity-60 flex items-center gap-1">
                      <Clock className="size-3" aria-hidden="true" />
                      {new Date(rev.created_at).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-sm font-medium truncate mt-1">
                    {formatTypography(rev.title)}
                  </div>
                  <div className="text-xs opacity-60 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3" aria-hidden="true" />
                      {rev.blocks?.length || 0} блоков
                    </span>
                    <span>• Status: {rev.status}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="md:w-1/2 flex flex-col justify-between max-h-[450px] overflow-y-auto">
            {selectedRevision ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Детали выбранной версии</h3>
                  <p className="text-xs opacity-60">
                    Сохранена {new Date(selectedRevision.created_at).toLocaleString("ru-RU")}
                  </p>
                </div>

                <div className="bg-[rgba(0,0,0,0.2)] p-3 rounded-md text-xs space-y-2 border border-[rgba(255,255,255,0.06)]">
                  <div>
                    <span className="opacity-50">Название:</span>{" "}
                    <span className="font-medium text-white">{selectedRevision.title}</span>
                  </div>
                  <div>
                    <span className="opacity-50">Slug:</span>{" "}
                    <span className="font-mono">{selectedRevision.slug}</span>
                  </div>
                  {selectedRevision.seo_title && (
                    <div>
                      <span className="opacity-50">SEO Title:</span>{" "}
                      <span>{selectedRevision.seo_title}</span>
                    </div>
                  )}
                  <div>
                    <span className="opacity-50">Количество блоков:</span>{" "}
                    <span className="font-semibold text-white">
                      {selectedRevision.blocks?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[rgba(234,179,8,0.1)] border border-[rgba(234,179,8,0.3)] rounded-md text-xs text-yellow-200">
                  Восстановление загрузит блоки и SEO настройки из этой версии в редактор. Чтобы сохранить изменения на сервере, нажмите «Сохранить» после отката.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRestoreRevision(selectedRevision);
                    onClose();
                  }}
                  className="peak-admin__btn peak-admin__btn--primary w-full justify-center"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Восстановить эту версию в редактор
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm opacity-50 p-6 text-center">
                Выберите версию из списка слева для предпросмотра и восстановления.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
