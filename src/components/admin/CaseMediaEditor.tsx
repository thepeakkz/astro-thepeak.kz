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
  ImageIcon,
  Images,
  ImageUp,
  LayoutGrid,
  List,
  RefreshCw,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
        className={`peak-admin__media-row ${isDragging ? "is-dragging" : ""}`}
      >
        <div className="peak-admin__media-row-main">
          <div className="peak-admin__media-row-info">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="peak-admin__media-drag"
              aria-label={`Перетащить медиа ${index + 1}`}
            >
              <GripVertical className="size-4" />
            </button>

            <button type="button" className="peak-admin__media-thumb" onClick={onOpenSettings} aria-label={`Настроить медиа ${index + 1}`}>
              {isVideo ? (
                <video src={item.src} preload="metadata" muted />
              ) : (
                <img src={item.src} alt={name} />
              )}
              {isVideo && <span><FileVideo className="size-3" /></span>}
            </button>

            <div className="peak-admin__media-row-copy" onClick={onOpenSettings}>
              <div><span>#{index + 1}</span><strong title={name}>{name}</strong></div>
              <p>{isVideo ? <FileVideo className="size-3" /> : <ImageIcon className="size-3" />}{isVideo ? "Видео" : "Фото"}{isVideo && <em className={item.posterSrc ? "is-ready" : ""}>{item.posterSrc ? "WebP готов" : "Нужна обложка"}</em>}</p>
            </div>
          </div>

          <div className="peak-admin__media-row-actions">
            <button type="button" onClick={onOpenSettings} className="peak-admin__button peak-admin__button--outline"><Settings className="size-3.5" />Настроить</button>
            <button type="button" onClick={onDelete} className="peak-admin__icon-button peak-admin__icon-button--danger" aria-label="Удалить файл"><Trash2 className="size-4" /></button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`peak-admin__media-card ${isDragging ? "is-dragging" : ""}`}
    >
      <div className="peak-admin__media-card-tools">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="peak-admin__media-card-handle"
          aria-label={`Перетащить медиа ${index + 1}`}
        >
          <GripVertical className="size-4" />
        </button>
        <span>#{index + 1}</span>
        <button type="button" onClick={onDelete} className="peak-admin__media-card-delete" title="Удалить"><Trash2 className="size-3.5" /></button>
      </div>

      <button type="button" className="peak-admin__media-card-preview" style={{ aspectRatio: isVideo ? "9 / 16" : "1 / 1" }} onClick={onOpenSettings}>
        {isVideo ? (
          <video src={item.src} poster={item.posterSrc} preload="metadata" />
        ) : (
          <img src={item.src} alt={name} />
        )}
        <span className="peak-admin__media-card-overlay"><strong>{name}</strong><small><Settings className="size-3.5" /> Настроить</small></span>
        {isVideo && <em>{item.posterSrc ? "WebP готов" : "Без обложки"}</em>}
      </button>
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
  const reduceMotion = useReducedMotion();
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
              {formatTypography("Перетаскивайте за иконку слева для изменения порядка. Кликните по строке для настройки файла и WebP обложки.")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="peak-admin__view-switcher">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "is-active" : ""}
              title="Вид: Список (Компактный)"
              aria-label="Режим отображения: список"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "is-active" : ""}
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
              {formatTypography("Загрузить из хранилища")}
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
            <DndContext id={`case-media-${slug}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={items.map((_, idx) => `media-item-${idx}`)}
                strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
              >
                {viewMode === "grid" ? (
                  <div className="peak-admin__media-grid">
                    {items.map((item, index) => (
                      <SortableMediaItem
                        key={`media-item-${index}`}
                        id={`media-item-${index}`}
                        index={index}
                        item={item}
                        onDelete={() => commit(items.filter((_, idx) => idx !== index))}
                        onOpenSettings={() => setExpandedIndex(index)}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="peak-admin__media-list">
                    {items.map((item, index) => (
                      <SortableMediaItem
                        key={`media-item-${index}`}
                        id={`media-item-${index}`}
                        index={index}
                        item={item}
                        onDelete={() => commit(items.filter((_, idx) => idx !== index))}
                        onOpenSettings={() => setExpandedIndex(index)}
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

          <div className="peak-admin__case-media-add">
            <h3 className="peak-admin__settings-title flex items-center gap-2">
              <ImageUp className="size-4" style={{ color: "var(--peak-coral)" }} />
              {formatTypography("Добавить медиафайл в галерею")}
            </h3>
            <p className="peak-admin__section-description mb-3">
              {formatTypography("Выберите фото или видео. После загрузки файл автоматически появится в списке.")}
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

      <AnimatePresence>
        {selectedItem && expandedIndex !== null && (
          <motion.div className="peak-admin__media-drawer-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.15 }} onMouseDown={(event) => { if (event.currentTarget === event.target) setExpandedIndex(null); }}>
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="media-settings-title"
              className="peak-admin__media-drawer"
              initial={reduceMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="peak-admin__media-drawer-head">
                <div><p>Медиа #{expandedIndex + 1}</p><h3 id="media-settings-title">{selectedItem.name || assetName(selectedItem.src, expandedIndex)}</h3></div>
                <button type="button" onClick={() => setExpandedIndex(null)} aria-label="Закрыть настройки"><X className="size-5" /></button>
              </div>
              <div className="peak-admin__media-drawer-preview">
                {selectedItem.type === "video" ? <video src={selectedItem.src} poster={selectedItem.posterSrc} muted controls playsInline /> : <img src={selectedItem.src} alt="" />}
              </div>
              <div className="peak-admin__media-drawer-body">
                <section><h4>Основной файл</h4><p>{formatTypography("Замените файл, сохранив его позицию в галерее.")}</p><MediaUploader caseSlug={slug} folder="cases" mediaType={selectedItem.type} value={selectedItem.src} onChange={(url, type) => updateItem(expandedIndex, url, type)} /></section>
                {selectedItem.type === "video" && <section><div className="peak-admin__media-drawer-section-head"><div><h4>WebP-обложка</h4><p>{formatTypography("Постер показывается до запуска видео.")}</p></div>{selectedItem.posterSrc && <button type="button" onClick={() => updateItemPoster(expandedIndex, "")}>Удалить</button>}</div><MediaUploader accept="image/webp,image/*" caseSlug={slug} folder="cases" mediaType="image" value={selectedItem.posterSrc || ""} onChange={(posterUrl) => updateItemPoster(expandedIndex, posterUrl)} /></section>}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
