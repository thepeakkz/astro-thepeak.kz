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
    <div className="peak-admin__media-placeholder size-full">
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
  const project = (
    <>
      <span className="peak-admin__case-table-thumb">
        <CaseThumbnail item={item} />
      </span>
      <span className="peak-admin__case-table-name-wrap">
        <span className="peak-admin__case-table-name">{formatTypography(item.name)}</span>
        {isHidden && <span className="peak-admin__case-table-state">Скрыт</span>}
      </span>
    </>
  );

  return (
    <article
      ref={setNodeRef}
      role="row"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`peak-admin__case-table-row ${isHidden ? "peak-admin__case-table-row--hidden" : ""} ${isDragging ? "peak-admin__case-table-row--dragging" : ""}`}
    >
      <div role="cell" className="peak-admin__case-table-index">
        <button
          type="button"
          className="peak-admin__case-drag-handle"
          aria-label={`Изменить позицию кейса ${item.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden="true" />
          <span>{index + 1}</span>
        </button>
      </div>

      {item.adminEditUrl ? (
        <Link href={item.adminEditUrl} role="cell" className="peak-admin__case-table-project" title="Редактировать кейс">
          {project}
        </Link>
      ) : (
        <div role="cell" className="peak-admin__case-table-project">{project}</div>
      )}

      <div role="cell" className="peak-admin__case-table-category" title={item.type}>
        {formatTypography(item.type)}
      </div>
      <div role="cell" className="peak-admin__case-table-address" title={item.href}>{item.href}</div>

      <div role="cell" className="peak-admin__case-table-actions">
        <button
          type="button"
          className="peak-admin__table-action"
          onClick={onToggleHidden}
          aria-label={isHidden ? "Показать кейс на сайте" : "Скрыть кейс на сайте"}
          title={isHidden ? "Показать на сайте" : "Скрыть на сайте"}
        >
          {isHidden ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="peak-admin__table-action peak-admin__case-arrow"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Переместить кейс выше"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="peak-admin__table-action peak-admin__case-arrow"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="Переместить кейс ниже"
        >
          <ArrowDown className="size-4" aria-hidden="true" />
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
    <section className="peak-admin__case-media" aria-labelledby="cases-grid-title">
      <div className="peak-admin__case-media-heading">
        <div>
          <h2 id="cases-grid-title" className="peak-admin__section-title !mt-0">Порядок и видимость кейсов</h2>
          <p className="peak-admin__section-description">
            {formatTypography(`${visibleCount} из ${orderedHrefs.length} кейсов отображаются · Меняйте порядок перетаскиванием`)}
          </p>
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
          <div className="peak-admin__case-table" role="table" aria-label="Порядок и видимость кейсов">
            <div className="peak-admin__case-table-head" role="row">
              <div role="columnheader">#</div>
              <div role="columnheader">Проект</div>
              <div role="columnheader">Категория</div>
              <div role="columnheader">Адрес</div>
              <div role="columnheader" className="text-right">Действия</div>
            </div>
            <DndContext id={`cases-grid-${block.id}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedHrefs} strategy={verticalListSortingStrategy}>
                <div role="rowgroup">
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
        </>
      )}
    </section>
  );
}
