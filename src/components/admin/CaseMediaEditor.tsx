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
  FileVideo,
  GripVertical,
  Images,
  LayoutGrid,
  List,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  item: CaseGalleryItem;
  onDelete: () => void;
  onOpenSettings: () => void;
  viewMode: "grid" | "list";
}

function SortableMediaItem({
  id,
  index,
  item,
  onDelete,
  onOpenSettings,
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
        className={`flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors ${
          isDragging ? "opacity-60 shadow-lg bg-orange-50/50" : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700"
            aria-label={`Перетащить медиа ${index + 1}`}
          >
            <GripVertical className="size-3.5" />
          </button>

          <button
            type="button"
            className="relative size-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200"
            onClick={onOpenSettings}
          >
            {isVideo ? (
              <video src={item.src} preload="metadata" muted className="size-full object-cover" />
            ) : (
              <img src={item.src} alt={name} className="size-full object-cover" />
            )}
            {isVideo && (
              <span className="absolute bottom-0.5 right-0.5 size-3.5 bg-black/70 rounded flex items-center justify-center text-orange-400">
                <FileVideo className="size-2.5" />
              </span>
            )}
          </button>

          <div className="min-w-0 flex-1 cursor-pointer" onClick={onOpenSettings}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
              <strong className="text-xs font-semibold text-slate-800 truncate block" title={name}>
                {name}
              </strong>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              <span>{isVideo ? "Видео" : "Изображение"}</span>
              {isVideo && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    item.posterSrc
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {item.posterSrc ? "WebP обложка" : "Нужна обложка"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="peak-admin__button peak-admin__button--outline !h-7 !text-xs !px-2.5"
          >
            <Settings className="size-3" />
            <span>Настроить</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="peak-admin__icon-button peak-admin__icon-button--danger !size-7"
            aria-label="Удалить файл"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-all ${
        isDragging ? "opacity-60 shadow-lg border-orange-500" : "hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between p-2 bg-slate-50 border-b border-slate-200">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700"
          aria-label={`Перетащить медиа ${index + 1}`}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-slate-400 hover:text-red-600 rounded"
          title="Удалить"
        >
          <Trash2 className="size-3" />
        </button>
      </div>

      <div
        className="relative bg-slate-100 cursor-pointer aspect-video overflow-hidden"
        onClick={onOpenSettings}
      >
        {isVideo ? (
          <video src={item.src} poster={item.posterSrc} preload="metadata" className="size-full object-cover" />
        ) : (
          <img src={item.src} alt={name} className="size-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white">
          <Settings className="size-3.5" />
          <span>Настроить</span>
        </div>
      </div>
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
  const selectedItem = expandedIndex === null ? null : items[expandedIndex];

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
    }
  }

  function deleteItem(index: number) {
    commit(items.filter((_, itemIndex) => itemIndex !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {formatTypography(error)}
        </div>
      )}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Images className="size-3.5 text-orange-600" />
            <span>Медиатека кейса</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {formatTypography(`${items.length} файлов · Drag & Drop для изменения порядка`)}
          </p>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-1 rounded-md transition-colors ${
              viewMode === "list" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500"
            }`}
          >
            <List className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1 rounded-md transition-colors ${
              viewMode === "grid" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500"
            }`}
          >
            <LayoutGrid className="size-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Загрузка медиатеки…</div>
      ) : (
        <div className="space-y-4">
          {items.length > 0 ? (
            <DndContext
              id={`case-gallery-${slug}`}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((_, idx) => `media-item-${idx}`)}
                strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 gap-3"
                      : "border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white"
                  }
                >
                  {items.map((item, index) => (
                    <SortableMediaItem
                      key={`media-item-${index}`}
                      id={`media-item-${index}`}
                      index={index}
                      item={item}
                      onDelete={() => deleteItem(index)}
                      onOpenSettings={() => setExpandedIndex(index)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              В галерее пока нет файлов. Загрузите фото или видео ниже.
            </div>
          )}

          {/* Дропзона загрузки новых файлов */}
          <div className="pt-2">
            <MediaUploader
              value=""
              multiple
              folder="cases"
              caseSlug={slug}
              onBatchChange={(newBatch) => {
                const mapped: CaseGalleryItem[] = newBatch.map((f, i) => ({
                  src: f.url,
                  type: f.mediaType,
                  name: f.name || assetName(f.url, items.length + i),
                }));
                commit([...items, ...mapped]);
              }}
              onChange={(url, mediaType) => {
                if (!url) return;
                commit([...items, { src: url, type: mediaType, name: assetName(url, items.length) }]);
              }}
            />
          </div>
        </div>
      )}

      {/* Модальное окно настройки медиафайла / постера — Light */}
      <AnimatePresence>
        {selectedItem && expandedIndex !== null && (
          <div className="peak-admin__modal-backdrop" role="presentation">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="peak-admin__modal-card !max-w-lg bg-white"
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="peak-admin__modal-header">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Настройка медиа #{expandedIndex + 1}
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                    {selectedItem.name || assetName(selectedItem.src, expandedIndex)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedIndex(null)}
                  className="peak-admin__icon-button"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="peak-admin__modal-body space-y-4">
                {/* Превью файла */}
                <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 max-h-[220px] flex items-center justify-center">
                  {selectedItem.type === "video" ? (
                    <video
                      src={selectedItem.src}
                      poster={selectedItem.posterSrc}
                      controls
                      playsInline
                      className="size-full max-h-[220px] object-contain"
                    />
                  ) : (
                    <img src={selectedItem.src} alt="" className="size-full max-h-[220px] object-contain" />
                  )}
                </div>

                {/* Если видео — загрузчик постера */}
                {selectedItem.type === "video" && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="block text-xs font-semibold text-slate-800">
                      WebP Обложка (Постер) для видео
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Отображается до запуска видео для мгновенной загрузки страницы.
                    </p>
                    <MediaUploader
                      value={selectedItem.posterSrc || ""}
                      accept="image/*"
                      folder="cases"
                      caseSlug={slug}
                      onChange={(posterUrl) => updateItemPoster(expandedIndex, posterUrl)}
                    />
                  </div>
                )}
              </div>

              <div className="peak-admin__modal-footer">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(null)}
                  className="peak-admin__button peak-admin__button--primary"
                >
                  Готово
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
