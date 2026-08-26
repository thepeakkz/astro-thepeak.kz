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
    <div className="flex items-center justify-center size-full bg-slate-100 text-[10px] text-slate-500">
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
        isDragging ? "opacity-60 shadow-lg bg-orange-50/50" : ""
      }`}
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
          <span className="text-[11px] text-slate-500 truncate block">{formatTypography(item.type)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
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
        <button
          type="button"
          className="peak-admin__icon-button peak-admin__icon-button--danger !size-7"
          onClick={onRemove}
          aria-label="Исключить из главной"
          title="Исключить из главной"
        >
          <Trash2 className="size-3" />
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
    <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Кейсы на главной странице
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {formatTypography(`${selectedCasesList.length} из ${availableCases.length} кейсов выбрано · Перетаскивайте для изменения порядка`)}
          </p>
        </div>
        <button
          type="button"
          className="peak-admin__button peak-admin__button--outline !h-7 !text-xs !px-2.5"
          onClick={resetToDefault}
        >
          <RefreshCw className="size-3" />
          <span>Сбросить</span>
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

          {selectedCasesList.length > 0 ? (
            <DndContext id="home-cases-editor" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedHrefs} strategy={verticalListSortingStrategy}>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-xs">
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
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
              На главную страницу не выбрано ни одного кейса.
            </div>
          )}

          {/* Выбор для добавления */}
          {unselectedCasesList.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">
                Добавить кейс на главную
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={selectedToAdd}
                  onChange={(e) => setSelectedToAdd(e.target.value)}
                  className="peak-admin__select !h-8 !text-xs flex-1 min-w-[200px]"
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
                  className="peak-admin__button peak-admin__button--primary !h-8 !text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Добавить</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
