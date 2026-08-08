"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, FolderKanban, RefreshCw } from "lucide-react";
import type { CaseItem } from "@/data/cases";
import type { CmsEditorBlock } from "@/types/cms";
import { formatTypography } from "@/utils/typography";
import { parseStringArray } from "@/lib/utils";

function CaseThumbnail({ item }: { item: CaseItem }) {
  const poster = item.poster;
  const image = item.image;
  const video = item.video;

  if (poster) {
    return <img src={poster} alt="" className="size-full object-cover" />;
  }
  if (image) {
    if (/\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(image)) {
      return <video src={image} className="size-full object-cover" muted playsInline preload="metadata" />;
    }
    return <img src={image} alt="" className="size-full object-cover" />;
  }
  if (video) {
    return <video src={video} className="size-full object-cover" muted playsInline preload="metadata" />;
  }
  return (
    <div className="flex size-full items-center justify-center bg-slate-200 text-[10px] font-mono text-slate-400">
      No img
    </div>
  );
}

export default function CasesGridEditor({
  block,
  initialAvailableCases,
  onContentChange,
}: {
  block: CmsEditorBlock;
  initialAvailableCases?: CaseItem[];
  onContentChange: (name: string, value: string) => void;
}) {
  const [availableCases, setAvailableCases] = useState<CaseItem[]>(initialAvailableCases || []);
  const [loading, setLoading] = useState(!initialAvailableCases || initialAvailableCases.length === 0);
  const [error, setError] = useState("");

  const savedOrder = parseStringArray(block.content.caseOrder);
  const savedHidden = parseStringArray(block.content.hiddenHrefs) || [];

  useEffect(() => {
    if (initialAvailableCases && initialAvailableCases.length > 0) {
      setAvailableCases(initialAvailableCases);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch("/api/admin/cases-list", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Не удалось загрузить список кейсов.");
        const data = (await response.json()) as { cases?: CaseItem[] };
        setAvailableCases(data.cases || []);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Ошибка при загрузке кейсов.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [initialAvailableCases]);

  const casesByHref = useMemo(() => {
    return new Map(availableCases.map((c) => [c.href, c]));
  }, [availableCases]);

  const orderedHrefs = useMemo(() => {
    const baseList = availableCases.map((c) => c.href);
    if (!savedOrder || savedOrder.length === 0) return baseList;

    const savedSet = new Set(savedOrder);
    const existingSaved = savedOrder.filter((href) => casesByHref.has(href));
    const missing = baseList.filter((href) => !savedSet.has(href));
    return [...existingSaved, ...missing];
  }, [availableCases, savedOrder, casesByHref]);

  const hiddenSet = useMemo(() => new Set(savedHidden), [savedHidden]);

  function updateState(nextOrder: string[], nextHidden: string[]) {
    onContentChange("caseOrder", JSON.stringify(nextOrder));
    onContentChange("hiddenHrefs", JSON.stringify(nextHidden));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedHrefs.length) return;
    const nextOrder = [...orderedHrefs];
    [nextOrder[index], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[index]];
    updateState(nextOrder, savedHidden);
  }

  function toggleHidden(href: string) {
    const nextHidden = hiddenSet.has(href)
      ? savedHidden.filter((h) => h !== href)
      : [...savedHidden, href];
    updateState(orderedHrefs, nextHidden);
  }

  function resetAll() {
    if (window.confirm("Сбросить порядок и видимость кейсов к состоянию по умолчанию?")) {
      updateState([], []);
    }
  }

  const visibleCount = orderedHrefs.filter((href) => !hiddenSet.has(href)).length;

  return (
    <section className="peak-admin__case-media" aria-labelledby="cases-grid-title">
      <div className="peak-admin__case-media-heading">
        <div className="flex items-start gap-3">
          <span className="peak-admin__media-field-icon">
            <FolderKanban className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="cases-grid-title" className="peak-admin__section-title !mt-0">
              Порядок и видимость кейсов на странице /cases
            </h2>
            <p className="peak-admin__section-description">
              Изменяйте порядок кейсов и скрывайте ненужные проекты. Скрытые кейсы не отображаются в каталоге и в фильтрах.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="peak-admin__button peak-admin__button--outline shrink-0 text-xs"
          onClick={resetAll}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Сбросить порядок
        </button>
      </div>

      {loading ? (
        <p className="peak-admin__protected">Загружаем список кейсов…</p>
      ) : (
        <>
          {error && <p role="alert" className="peak-admin__notice peak-admin__notice--error">{formatTypography(error)}</p>}

          <div className="mb-4 text-xs font-semibold text-slate-700">
            Отображается: {visibleCount} из {orderedHrefs.length} кейсов ({orderedHrefs.length - visibleCount} скрыто)
          </div>

          <div className="flex flex-col gap-2">
            {orderedHrefs.map((href, index) => {
              const item = casesByHref.get(href);
              if (!item) return null;
              const isHidden = hiddenSet.has(href);

              return (
                <article
                  key={href}
                  className={`flex items-center justify-between gap-4 rounded-xl border p-3 shadow-xs transition-opacity ${
                    isHidden
                      ? "border-amber-200 bg-amber-50/50 opacity-60"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {item.adminEditUrl ? (
                    <Link
                      href={item.adminEditUrl}
                      className="flex items-center gap-3 min-w-0 flex-1 group"
                      title="Редактировать кейс"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-600">
                        {index + 1}
                      </span>
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                        <CaseThumbnail item={item} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                            {formatTypography(item.name)}
                          </h4>
                          {isHidden && (
                            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Скрыт
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500">
                          {item.type} · {item.href}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-600">
                        {index + 1}
                      </span>
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                        <CaseThumbnail item={item} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-sm font-semibold text-slate-900">
                            {formatTypography(item.name)}
                          </h4>
                          {isHidden && (
                            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Скрыт
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500">
                          {item.type} · {item.href}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      className={`peak-admin__icon-button ${isHidden ? "text-amber-700 hover:text-slate-900" : ""}`}
                      onClick={() => toggleHidden(href)}
                      aria-label={isHidden ? "Показать кейс на сайте" : "Скрыть кейс на сайте"}
                      title={isHidden ? "Показать на сайте" : "Скрыть на сайте"}
                    >
                      {isHidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button
                      type="button"
                      className="peak-admin__icon-button"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      aria-label="Переместить кейс выше"
                    >
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="peak-admin__icon-button"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === orderedHrefs.length - 1}
                      aria-label="Переместить кейс ниже"
                    >
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
