"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, RefreshCw } from "lucide-react";
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
    <div className="flex items-center justify-center size-full bg-slate-100 text-[10px] text-slate-500">
      Нет медиа
    </div>
  );
}

function SortableCaseRow({
  index,
  isHidden,
  item,
  onMove,
  onToggleHidden,
  total,
}: {
  index: number;
  isHidden: boolean;
  item: CaseItem;
  onMove: (direction: -1 | 1) => void;
  onToggleHidden: () => void;
  total: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.href });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors ${
        isHidden ? "opacity-50" : ""
      } ${isDragging ? "opacity-60 shadow-lg bg-orange-50/50" : ""}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700"
          aria-label={`Изменить позицию кейса ${item.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="text-[10px] font-mono text-slate-400 w-4 text-center">{index + 1}</span>

        <div className="size-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
          <CaseThumbnail item={item} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {item.adminEditUrl ? (
              <Link
                href={item.adminEditUrl}
                className="text-xs font-semibold text-slate-800 hover:text-slate-900 truncate block"
                title="Редактировать кейс"
              >
                {formatTypography(item.name)}
              </Link>
            ) : (
              <span className="text-xs font-semibold text-slate-800 truncate block">
                {formatTypography(item.name)}
              </span>
            )}
            {isHidden && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                Скрыт
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 truncate block">{formatTypography(item.type)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          className="peak-admin__icon-button !size-7"
          onClick={onToggleHidden}
          aria-label={isHidden ? "Показать кейс" : "Скрыть кейс"}
          title={isHidden ? "Показать кейс" : "Скрыть кейс"}
        >
          {isHidden ? (
            <EyeOff className="size-3.5 text-slate-400" />
          ) : (
            <Eye className="size-3.5 text-emerald-600" />
          )}
        </button>
        <button
          type="button"
          className="peak-admin__icon-button !size-7"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Переместить выше"
        >
          <ArrowUp className="size-3" />
        </button>
        <button
          type="button"
          className="peak-admin__icon-button !size-7"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="Переместить ниже"
        >
          <ArrowDown className="size-3" />
        </button>
      </div>
    </article>
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const savedOrder = useMemo(() => parseStringArray(block.content.caseOrder), [block.content.caseOrder]);
  const savedHidden = useMemo(() => parseStringArray(block.content.hiddenHrefs) || [], [block.content.hiddenHrefs]);

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedHrefs.indexOf(String(active.id));
    const newIndex = orderedHrefs.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    updateState(arrayMove(orderedHrefs, oldIndex, newIndex), savedHidden);
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
    <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Порядок и видимость кейсов в каталоге
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {formatTypography(`${visibleCount} из ${orderedHrefs.length} кейсов отображаются на сайте`)}
          </p>
        </div>
        <button
          type="button"
          className="peak-admin__button peak-admin__button--outline !h-7 !text-xs !px-2.5"
          onClick={resetAll}
        >
          <RefreshCw className="size-3" />
          <span>Сбросить порядок</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Загрузка кейсов…</div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {formatTypography(error)}
            </div>
          )}

          <DndContext id={`cases-grid-${block.id}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedHrefs} strategy={verticalListSortingStrategy}>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-xs">
                {orderedHrefs.map((href, index) => {
                  const item = casesByHref.get(href);
                  if (!item) return null;
                  return (
                    <SortableCaseRow
                      key={href}
                      index={index}
                      isHidden={hiddenSet.has(href)}
                      item={item}
                      onMove={(direction) => moveItem(index, direction)}
                      onToggleHidden={() => toggleHidden(href)}
                      total={orderedHrefs.length}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </section>
  );
}
