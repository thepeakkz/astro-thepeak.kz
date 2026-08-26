"use client";

import { useEffect, useState, useTransition } from "react";
import { History, RotateCcw, X, Clock, Layers, FileText } from "lucide-react";
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
        const list = (res.revisions || []) as CmsPageRevision[];
        setRevisions(list);
        if (list.length > 0) setSelectedRevision(list[0]);
        setLoading(false);
      });
    }
  }, [isOpen, pageId]);

  if (!isOpen) return null;

  return (
    <div
      className="peak-admin__modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="peak-admin__modal-card !max-w-4xl bg-white"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="peak-admin__modal-header">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
              <History className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                История версий страницы
              </h2>
              <p className="text-xs text-slate-500">
                Снимки состояния сохраняются при каждом изменении
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="peak-admin__icon-button"
            title="Закрыть"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[65vh] overflow-hidden">
          {/* Левая колонка: Список снимков */}
          <div className="md:col-span-5 border-r border-slate-200 pr-0 md:pr-4 overflow-y-auto space-y-2 max-h-[55vh]">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Загрузка истории…</div>
            ) : revisions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                История версий пока пуста. При сохранении страницы здесь будут появляться сохранённые снимки.
              </div>
            ) : (
              revisions.map((rev, idx) => {
                const isSelected = selectedRevision?.id === rev.id;
                return (
                  <button
                    key={rev.id}
                    type="button"
                    onClick={() => setSelectedRevision(rev)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "border-orange-500 bg-orange-50 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {idx === 0 ? "Последняя" : `Снимок #${revisions.length - idx}`}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="size-3" />
                        {new Date(rev.created_at).toLocaleString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {formatTypography(rev.title)}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Layers className="size-3" />
                        {rev.blocks?.length || 0} секций
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Правая колонка: Детали выбранного снимка */}
          <div className="md:col-span-7 flex flex-col justify-between overflow-y-auto max-h-[55vh] pr-1">
            {selectedRevision ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Название
                    </span>
                    <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                      {formatTypography(selectedRevision.title)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                        Адрес
                      </span>
                      <span className="font-mono text-slate-700 block mt-0.5">
                        /{selectedRevision.slug}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                        Статус
                      </span>
                      <span className="text-slate-700 block mt-0.5">
                        {selectedRevision.status === "published" ? "Опубликована" : "Черновик"}
                      </span>
                    </div>
                  </div>

                  {selectedRevision.seo_title && (
                    <div className="text-xs">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                        SEO Заголовок
                      </span>
                      <span className="text-slate-600 block mt-0.5">
                        {formatTypography(selectedRevision.seo_title)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    Секции в снимке ({selectedRevision.blocks?.length || 0})
                  </h4>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {(selectedRevision.blocks || []).map((b, idx) => {
                      const content = b.content as Record<string, unknown> | undefined;
                      const title = typeof content?.title === "string"
                        ? content.title
                        : typeof content?.heading === "string"
                        ? content.heading
                        : `Секция #${idx + 1}`;

                      return (
                        <div
                          key={b.id || idx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                        >
                          <FileText className="size-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreRevision(selectedRevision);
                      onClose();
                    }}
                    className="peak-admin__button peak-admin__button--primary !h-9 !text-xs"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Восстановить эту версию в редактор</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                Выберите версию слева для просмотра
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
