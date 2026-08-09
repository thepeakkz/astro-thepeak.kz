"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { ArrowDown, ArrowUp, GripVertical, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { CaseItem } from "@/data/cases";
import { parseSelectedHrefs, serializeSelectedHrefs } from "@/utils/cms";
import { formatTypography } from "@/utils/typography";
export { parseSelectedHrefs, serializeSelectedHrefs };

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

function SortableHomeCaseRow({
  href,
  index,
  item,
  onMove,
  onRemove,
  total,
}: {
  href: string;
  index: number;
  item: CaseItem;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  total: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: href });
  const project = (
    <>
      <span className="peak-admin__case-table-thumb"><CaseThumbnail item={item} /></span>
      <span className="peak-admin__case-table-name">{formatTypography(item.name)}</span>
    </>
  );

  return (
    <article
      ref={setNodeRef}
      role="row"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`peak-admin__case-table-row ${isDragging ? "peak-admin__case-table-row--dragging" : ""}`}
    >
      <div role="cell" className="peak-admin__case-table-index">
        <button type="button" className="peak-admin__case-drag-handle" aria-label={`Изменить позицию кейса ${item.name}`} {...attributes} {...listeners}>
          <GripVertical className="size-4" aria-hidden="true" />
          <span>{index + 1}</span>
        </button>
      </div>
      {item.adminEditUrl ? (
        <Link href={item.adminEditUrl} role="cell" className="peak-admin__case-table-project" title="Редактировать кейс">{project}</Link>
      ) : (
        <div role="cell" className="peak-admin__case-table-project">{project}</div>
      )}
      <div role="cell" className="peak-admin__case-table-category" title={item.type}>{formatTypography(item.type)}</div>
      <div role="cell" className="peak-admin__case-table-address" title={href}>{href}</div>
      <div role="cell" className="peak-admin__case-table-actions">
        <button type="button" className="peak-admin__table-action peak-admin__case-arrow" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Переместить кейс выше">
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className="peak-admin__table-action peak-admin__case-arrow" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Переместить кейс ниже">
          <ArrowDown className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className="peak-admin__table-action peak-admin__table-action--danger" onClick={onRemove} aria-label="Исключить кейс" title="Исключить из главной">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export const defaultHomeCasesOrder = [
  "/cases/lukoil",
  "/cases/shanding-logistics",
  "/cases/gippo",
  "/cases/puma",
  "/cases/compass",
  "/cases/sensata",
  "/cases/bazisa",
  "/cases/onmacabim",
  "/cases/diskokras",
  "/cases/cadillac",
  "/cases/velmar",
  "/cases/racoon",
];



export default function HomeCasesEditor({
  initialAvailableCases,
  onChange,
  value,
}: {
  initialAvailableCases?: CaseItem[];
  onChange: (value: string) => void;
  value: string;
}) {
  const savedHrefs = parseSelectedHrefs(value);
  const [availableCases, setAvailableCases] = useState<CaseItem[]>(initialAvailableCases || []);
  const [selectedHrefs, setSelectedHrefs] = useState<string[]>(savedHrefs || defaultHomeCasesOrder);
  const [selectedToAdd, setSelectedToAdd] = useState<string>("");
  const [loading, setLoading] = useState(!initialAvailableCases || initialAvailableCases.length === 0);
  const [error, setError] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const selectedCasesList = useMemo(() => {
    return selectedHrefs.flatMap((href) => {
      const caseItem = casesByHref.get(href);
      return caseItem ? [{ href, item: caseItem }] : [];
    });
  }, [selectedHrefs, casesByHref]);

  const unselectedCasesList = useMemo(() => {
    const selectedSet = new Set(selectedHrefs);
    return availableCases.filter((c) => !selectedSet.has(c.href));
  }, [availableCases, selectedHrefs]);

  function commit(nextHrefs: string[]) {
    setSelectedHrefs(nextHrefs);
    onChange(serializeSelectedHrefs(nextHrefs));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedHrefs.length) return;
    const nextHrefs = [...selectedHrefs];
    [nextHrefs[index], nextHrefs[nextIndex]] = [nextHrefs[nextIndex], nextHrefs[index]];
    commit(nextHrefs);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selectedHrefs.indexOf(String(active.id));
    const newIndex = selectedHrefs.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    commit(arrayMove(selectedHrefs, oldIndex, newIndex));
  }

  function removeItem(href: string) {
    commit(selectedHrefs.filter((h) => h !== href));
  }

  function addCase() {
    if (!selectedToAdd || selectedHrefs.includes(selectedToAdd)) return;
    commit([...selectedHrefs, selectedToAdd]);
    setSelectedToAdd("");
  }

  function resetToDefault() {
    if (window.confirm("Сбросить список кейсов на главной к варианту по умолчанию?")) {
      commit(defaultHomeCasesOrder);
    }
  }

  return (
    <section className="peak-admin__case-media" aria-labelledby="home-cases-title">
      <div className="peak-admin__case-media-heading">
        <div>
          <h2 id="home-cases-title" className="peak-admin__section-title !mt-0">Кейсы на главной странице</h2>
          <p className="peak-admin__section-description">
            {formatTypography(`${selectedCasesList.length} из ${availableCases.length} кейсов выбраны · Меняйте порядок перетаскиванием`)}
          </p>
        </div>
        <button
          type="button"
          className="peak-admin__button peak-admin__button--outline shrink-0 text-xs"
          onClick={resetToDefault}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Сбросить по умолчанию
        </button>
      </div>

      {loading ? (
        <p className="peak-admin__protected">Загружаем список кейсов…</p>
      ) : (
        <>
          {error && <p role="alert" className="peak-admin__notice peak-admin__notice--error">{formatTypography(error)}</p>}

          {selectedCasesList.length > 0 ? (
            <div className="peak-admin__case-table" role="table" aria-label="Кейсы на главной странице">
              <div className="peak-admin__case-table-head" role="row">
                <div role="columnheader">#</div>
                <div role="columnheader">Проект</div>
                <div role="columnheader">Категория</div>
                <div role="columnheader">Адрес</div>
                <div role="columnheader" className="text-right">Действия</div>
              </div>
              <DndContext id="home-cases-editor" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selectedHrefs} strategy={verticalListSortingStrategy}>
                  <div role="rowgroup">
                    {selectedCasesList.map(({ href, item }, index) => (
                      <SortableHomeCaseRow
                        key={href}
                        href={href}
                        index={index}
                        item={item}
                        onMove={(direction) => moveItem(index, direction)}
                        onRemove={() => removeItem(href)}
                        total={selectedCasesList.length}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <p className="peak-admin__protected">На главную страницу не выбрано ни одного кейса.</p>
          )}

          {unselectedCasesList.length > 0 && (
            <div className="peak-admin__case-media-add">
              <h3 className="peak-admin__settings-title mb-2">Добавить кейс на главную</h3>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedToAdd}
                  onChange={(e) => setSelectedToAdd(e.target.value)}
                  className="peak-admin__select max-w-md"
                >
                  <option value="">-- Выберите кейс из доступных --</option>
                  {unselectedCasesList.map((c) => (
                    <option key={c.href} value={c.href}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addCase}
                  disabled={!selectedToAdd}
                  className="peak-admin__button peak-admin__button--primary shrink-0 text-xs"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Добавить кейс
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
