"use client";

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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  FileVideo,
  GripVertical,
  ImageIcon,
  Images,
  ImageUp,
  LayoutGrid,
  List,
  RefreshCw,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import MediaUploader from "@/components/admin/MediaUploader";
import {
  parseCaseGallery,
  serializeCaseGallery,
  type CaseGalleryItem,
} from "@/lib/case-gallery";
import { formatTypography } from "@/utils/typography";

function assetName(url: string, index: number) {
  try {
    const pathName = new URL(url, "https://cms.local").pathname;
    return decodeURIComponent(pathName.split("/").pop() || `Медиа ${index + 1}`);
  } catch {
    return `Медиа ${index + 1}`;
  }
}

interface SortableMediaItemProps {
  id: string;
  index: number;
  isExpanded: boolean;
  item: CaseGalleryItem;
  onDelete: () => void;
  onToggleExpand: () => void;
  onUpdateItem: (url: string, type: "image" | "video") => void;
  onUpdatePoster: (posterUrl: string) => void;
  slug: string;
  viewMode: "grid" | "list";
}

function SortableMediaItem({
  id,
  index,
  isExpanded,
  item,
  onDelete,
  onToggleExpand,
  onUpdateItem,
  onUpdatePoster,
  slug,
  viewMode,
}: SortableMediaItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const name = item.name || assetName(item.src, index);
  const isVideo = item.type === "video";

  if (viewMode === "list") {
    return (
      <article
        ref={setNodeRef}
        style={style}
        className={`peak-admin__case-media-row flex flex-col bg-white border border-slate-200 transition-shadow ${
          isDragging ? "shadow-lg opacity-75 ring-2 ring-[#FD4B32]" : "shadow-xs hover:border-slate-300"
        }`}
      >
        {/* Компактная строка таблицы (Table/Notion View) */}
        <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Drag Handle */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="peak-admin__drag-handle cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 shrink-0"
              aria-label={`Перетащить медиа ${index + 1}`}
            >
              <GripVertical className="size-4" />
            </button>

            {/* Компактная миниатюра (crop) */}
            <div
              className="relative size-12 sm:w-16 sm:h-11 shrink-0 overflow-hidden bg-slate-950 border border-slate-200 cursor-pointer"
              onClick={onToggleExpand}
            >
              {isVideo ? (
                <video src={item.src} className="size-full object-cover" preload="metadata" muted />
              ) : (
                <img src={item.src} alt={name} className="size-full object-cover" />
              )}
              {isVideo && (
                <span className="absolute bottom-1 right-1 bg-black/70 p-0.5 text-white">
                  <FileVideo className="size-3" />
                </span>
              )}
            </div>

            {/* Метаданные по центру */}
            <div className="min-w-0 flex-1 cursor-pointer" onClick={onToggleExpand}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-slate-400 font-bold">#{index + 1}</span>
                <span className="truncate text-sm font-semibold text-slate-900" title={name}>
                  {name}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {isVideo ? <FileVideo className="size-3 text-slate-400" /> : <ImageIcon className="size-3 text-slate-400" />}
                  {isVideo ? "Видео" : "Фото"}
                </span>
                {isVideo && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 border ${
                      item.posterSrc
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {item.posterSrc ? "С обложкой WebP" : "Без обложки"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Правые элементы управления */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleExpand}
              className={`peak-admin__button peak-admin__button--outline !py-1.5 !px-2.5 text-xs ${
                isExpanded ? "!bg-slate-100 !text-slate-900" : ""
              }`}
              title="Настроить медиа"
            >
              <Settings className="size-3.5" />
              <span className="hidden sm:inline">Настроить</span>
              {isExpanded ? <ChevronUp className="size-3.5 ml-0.5" /> : <ChevronDown className="size-3.5 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="peak-admin__icon-button peak-admin__icon-button--danger"
              aria-label="Удалить файл"
              title="Удалить"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Раскрывающийся аккордеон (Accordion) */}
        {isExpanded && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Основной медиафайл ({isVideo ? "Видео" : "Фото"})
                </span>
                <MediaUploader
                  caseSlug={slug}
                  folder="cases"
                  mediaType={item.type}
                  value={item.src}
                  onChange={(url, type) => onUpdateItem(url, type)}
                />
              </div>

              {isVideo && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      WebP обложка (постер для видео)
                    </span>
                    {item.posterSrc && (
                      <button
                        type="button"
                        onClick={() => onUpdatePoster("")}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Удалить обложку
                      </button>
                    )}
                  </div>
                  <MediaUploader
                    accept="image/webp,image/*"
                    caseSlug={slug}
                    folder="cases"
                    mediaType="image"
                    value={item.posterSrc || ""}
                    onChange={(posterUrl) => onUpdatePoster(posterUrl)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    );
  }

  /* Режим сетки (WYSIWYG Grid) */
  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`peak-admin__wysiwyg-card group relative bg-zinc-950 border border-slate-800 overflow-hidden transition-all ${
        isDragging ? "ring-2 ring-[#FD4B32] opacity-75 shadow-xl" : "hover:border-slate-500"
      }`}
    >
      {/* Шапка карточки в сетке */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="peak-admin__drag-handle pointer-events-auto p-1.5 bg-black/70 backdrop-blur text-white hover:bg-black"
          aria-label={`Перетащить медиа ${index + 1}`}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex items-center gap-1 pointer-events-auto">
          <span className="bg-black/70 backdrop-blur text-white font-mono text-[11px] font-bold px-2 py-0.5">
            #{index + 1}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white backdrop-blur"
            title="Удалить"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Пропорции в точности повторяют фронтенд кейса (9/16 для видео) */}
      <div
        className="relative w-full bg-zinc-900 overflow-hidden cursor-pointer"
        style={{ aspectRatio: isVideo ? "9 / 16" : "1 / 1" }}
        onClick={onToggleExpand}
      >
        {isVideo ? (
          <video
            src={item.src}
            poster={item.posterSrc}
            preload="metadata"
            className="size-full object-cover"
          />
        ) : (
          <img src={item.src} alt={name} className="size-full object-cover" />
        )}

        {/* Оверлей при наведении */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
          <div />
          <div className="pointer-events-auto flex flex-col gap-2">
            <span className="text-xs font-semibold text-white truncate drop-shadow-xs">{name}</span>
            <button
              type="button"
              onClick={onToggleExpand}
              className="peak-admin__button peak-admin__button--dark !py-1 text-xs w-full justify-center"
            >
              <Settings className="size-3.5" />
              {isExpanded ? "Свернуть" : "Настроить"}
            </button>
          </div>
        </div>

        {/* Индикатор видео / обложки */}
        {isVideo && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 bg-black/70 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5">
              <FileVideo className="size-3" />
              {item.posterSrc ? "WebP обложка" : "Без обложки"}
            </span>
          </div>
        )}
      </div>

      {/* Аккордеон при клике "Настроить" в сетке */}
      {isExpanded && (
        <div className="p-3 bg-white border-t border-slate-200 space-y-3 text-slate-900">
          <div>
            <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Заменить файл
            </span>
            <MediaUploader
              caseSlug={slug}
              folder="cases"
              mediaType={item.type}
              value={item.src}
              onChange={(url, type) => onUpdateItem(url, type)}
            />
          </div>
          {isVideo && (
            <div>
              <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Обложка (WebP постер)
              </span>
              <MediaUploader
                accept="image/webp,image/*"
                caseSlug={slug}
                folder="cases"
                mediaType="image"
                value={item.posterSrc || ""}
                onChange={(posterUrl) => onUpdatePoster(posterUrl)}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function CaseMediaEditor({
  onChange,
  slug,
  value,
}: {
  onChange: (value: string) => void;
  slug: string;
  value: string;
}) {
  const savedItems = parseCaseGallery(value);
  const hasSavedGallery = savedItems !== undefined;
  const [items, setItems] = useState<CaseGalleryItem[]>(savedItems || []);
  const [loading, setLoading] = useState(!hasSavedGallery);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const parsed = parseCaseGallery(value);
    if (parsed !== undefined) {
      setItems(parsed);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/case-videos?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Не удалось загрузить текущую галерею.");
        const data = (await response.json()) as { media?: CaseGalleryItem[]; videos?: CaseGalleryItem[] };
        const media = Array.isArray(data.media) ? data.media : data.videos;
        setItems(parseCaseGallery(media) || []);
      })
      .catch((loadError) => {
        if (controller.signal.aborted) return;
        setItems([]);
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить текущую галерею.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug, value]);

  function commit(nextItems: CaseGalleryItem[]) {
    setItems(nextItems);
    onChange(serializeCaseGallery(nextItems));
  }

  function updateItem(index: number, url: string, type: "image" | "video") {
    if (!url) {
      commit(items.filter((_, itemIndex) => itemIndex !== index));
      if (expandedIndex === index) setExpandedIndex(null);
      return;
    }

    commit(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, src: url, type, name: assetName(url, index) } : item,
      ),
    );
  }

  function updateItemPoster(index: number, posterUrl: string) {
    commit(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, posterSrc: posterUrl || undefined } : item,
      ),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((_, idx) => `media-item-${idx}` === active.id);
    const newIndex = items.findIndex((_, idx) => `media-item-${idx}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(items, oldIndex, newIndex);
      commit(reordered);
      if (expandedIndex === oldIndex) setExpandedIndex(newIndex);
    }
  }

  return (
    <section className="peak-admin__case-media" aria-labelledby="case-media-title">
      <div className="peak-admin__case-media-heading flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="peak-admin__media-field-icon">
            <Images className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="case-media-title" className="peak-admin__section-title !mt-0">
              Медиа кейса ({items.length})
            </h2>
            <p className="peak-admin__section-description">
              Перетаскивайте за иконку слева для изменения порядка. Кликните по строке для настройки файла и WebP обложки.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`peak-admin__icon-button !size-8 ${
                viewMode === "list" ? "!bg-white !text-slate-900 shadow-xs" : "!text-slate-500"
              }`}
              title="Вид: Список (Компактный)"
              aria-label="Режим отображения: список"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`peak-admin__icon-button !size-8 ${
                viewMode === "grid" ? "!bg-white !text-slate-900 shadow-xs" : "!text-slate-500"
              }`}
              title="Вид: WYSIWYG Сетка"
              aria-label="Режим отображения: плитка"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>

          {hasSavedGallery && (
            <button
              type="button"
              className="peak-admin__button peak-admin__button--outline shrink-0 text-xs"
              onClick={() => onChange("")}
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Загрузить из хранилища
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="peak-admin__protected">Загружаем текущие медиа…</p>
      ) : (
        <>
          {error && (
            <p role="alert" className="peak-admin__notice peak-admin__notice--error">
              {formatTypography(error)}
            </p>
          )}

          {items.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={items.map((_, idx) => `media-item-${idx}`)}
                strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
              >
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {items.map((item, index) => (
                      <SortableMediaItem
                        key={`media-item-${index}`}
                        id={`media-item-${index}`}
                        index={index}
                        isExpanded={expandedIndex === index}
                        item={item}
                        onDelete={() => commit(items.filter((_, idx) => idx !== index))}
                        onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        onUpdateItem={(url, type) => updateItem(index, url, type)}
                        onUpdatePoster={(posterUrl) => updateItemPoster(index, posterUrl)}
                        slug={slug}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map((item, index) => (
                      <SortableMediaItem
                        key={`media-item-${index}`}
                        id={`media-item-${index}`}
                        index={index}
                        isExpanded={expandedIndex === index}
                        item={item}
                        onDelete={() => commit(items.filter((_, idx) => idx !== index))}
                        onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        onUpdateItem={(url, type) => updateItem(index, url, type)}
                        onUpdatePoster={(posterUrl) => updateItemPoster(index, posterUrl)}
                        slug={slug}
                        viewMode="list"
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="peak-admin__protected">В галерее пока нет файлов.</p>
          )}

          <div className="peak-admin__case-media-add mt-6 border-t border-slate-200 pt-4">
            <h3 className="peak-admin__settings-title flex items-center gap-2">
              <ImageUp className="size-4 text-[#FD4B32]" />
              Добавить медиафайл в галерею
            </h3>
            <p className="peak-admin__section-description mb-3">
              Выберите фото или видео. После загрузки файл автоматически появится в списке.
            </p>
            <MediaUploader
              caseSlug={slug}
              folder="cases"
              multiple={true}
              value=""
              onChange={(url, type) => {
                if (!url) return;
                commit([...items, { src: url, type, name: assetName(url, items.length) }]);
              }}
              onBatchChange={(batch) => {
                if (batch.length === 0) return;
                const nextItems = [
                  ...items,
                  ...batch.map((b, idx) => ({
                    src: b.url,
                    type: b.mediaType,
                    name: b.name || assetName(b.url, items.length + idx),
                  })),
                ];
                commit(nextItems);
              }}
            />
          </div>
        </>
      )}
    </section>
  );
}
