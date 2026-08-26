"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
import {
  ArrowLeft,
  Check,
  CloudOff,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  History,
  ImageUp,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Send,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { savePageAction } from "@/app/admin/actions";
import CaseMediaEditor from "@/components/admin/CaseMediaEditor";
import CasesGridEditor from "@/components/admin/CasesGridEditor";
import HomeCasesEditor from "@/components/admin/HomeCasesEditor";
import MediaUploader from "@/components/admin/MediaUploader";
import RevisionHistoryModal from "@/components/admin/RevisionHistoryModal";
import type { CaseItem } from "@/data/cases";
import type { CmsBlockTemplate, CmsEditorBlock, CmsField, CmsPage, CmsPageRevision, CmsPageStatus } from "@/types/cms";
import { formatTypography } from "@/utils/typography";

/* ─── Тип черновика в localStorage ─── */
type LocalDraft = {
  savedAt: string;
  page: {
    title: string;
    slug: string;
    status: CmsPageStatus;
    seoTitle: string;
    seoDescription: string;
  };
  blocks: Array<{
    id: string;
    block_id: string;
    page_id: string;
    sort_order: number;
    content: Record<string, string>;
    is_visible: boolean;
    template: CmsBlockTemplate;
  }>;
};

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function draftKey(pageId: string) {
  return `peak-draft:${pageId}`;
}

function loadDraft(pageId: string): LocalDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftKey(pageId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as LocalDraft;
    if (Date.now() - new Date(draft.savedAt).getTime() > DRAFT_TTL_MS) {
      localStorage.removeItem(draftKey(pageId));
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function saveDraft(pageId: string, draft: LocalDraft) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(draftKey(pageId), JSON.stringify(draft));
  } catch {
    // localStorage quota exceeded or private mode
  }
}

function clearDraft(pageId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(draftKey(pageId));
  } catch { /* noop */ }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function FieldEditor({
  block,
  field,
  onContentChange,
  uploadFolder,
}: {
  block: CmsEditorBlock;
  field: CmsField;
  onContentChange: (name: string, value: string) => void;
  uploadFolder: "pages" | "cases";
}) {
  const value = stringValue(block.content[field.name]);

  if (field.type === "media") {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">
            <ImageUp className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800">
              {formatTypography(field.label)}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </h4>
            <p className="text-[11px] text-slate-500">
              {formatTypography("Загрузите изображение или видео")}
            </p>
          </div>
        </div>
        <MediaUploader
          value={value}
          accept={field.accept}
          folder={uploadFolder}
          mediaType={field.mediaTypeField ? stringValue(block.content[field.mediaTypeField]) : undefined}
          onChange={(url, mediaType) => {
            onContentChange(field.name, url);
            if (field.mediaTypeField) onContentChange(field.mediaTypeField, mediaType);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-700">
        {formatTypography(field.label)}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onContentChange(field.name, event.target.value)}
          required={field.required}
          rows={4}
          maxLength={10_000}
          className="peak-admin__textarea"
          placeholder={`Введите ${field.label.toLowerCase()}…`}
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(event) => onContentChange(field.name, event.target.value)}
          required={field.required}
          className="peak-admin__select"
        >
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(event) => onContentChange(field.name, event.target.value)}
          required={field.required}
          type={field.type === "url" ? "text" : field.type}
          inputMode={field.type === "url" ? "url" : undefined}
          maxLength={field.type === "url" ? 2_048 : 240}
          className="peak-admin__input"
          placeholder={field.type === "url" ? "https://… или /contacts" : undefined}
        />
      )}
    </div>
  );
}

function SortableSectionTab({
  active,
  block,
  index,
  onSelect,
}: {
  active: boolean;
  block: CmsEditorBlock;
  index: number;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
        active
          ? "bg-slate-100 text-slate-950 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      } ${isDragging ? "opacity-60 bg-white shadow-md border border-orange-500" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label={`Переместить секцию ${block.template.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3.5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-xs truncate block">
              {formatTypography(block.template.name)}
            </span>
            {!block.is_visible && (
              <span className="text-[10px] text-slate-400 font-normal">
                (скрыта)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockEditorPanel({
  availableCases,
  block,
  protectedBlock,
  uploadFolder,
  onChange,
  onDelete,
  onToggleVisible,
}: {
  availableCases?: CaseItem[];
  block: CmsEditorBlock;
  protectedBlock: boolean;
  uploadFolder: "pages" | "cases";
  onChange: (name: string, value: string) => void;
  onDelete: () => void;
  onToggleVisible: () => void;
}) {
  const automaticMediaTypeFields = new Set(
    block.template.fields.flatMap((field) => (field.mediaTypeField ? [field.mediaTypeField] : [])),
  );
  const editableFields = block.template.fields
    .filter((field) => !automaticMediaTypeFields.has(field.name))
    .sort((left, right) => Number(right.type === "media") - Number(left.type === "media"));
  const hasMedia = editableFields.some((field) => field.type === "media");

  return (
    <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Шапка блока */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-800">
              {formatTypography(block.template.name)}
            </h2>
            {hasMedia && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-orange-50 border border-orange-200 text-orange-600 rounded-md">
                Медиа
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {formatTypography(
              stringValue(block.content.title) ||
                stringValue(block.content.heading) ||
                block.template.description,
            )}
          </p>
        </div>

        {/* Действия с блоком */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleVisible}
            className={`peak-admin__button !h-8 !text-xs ${
              block.is_visible ? "peak-admin__button--outline" : "peak-admin__button--ghost"
            }`}
          >
            {block.is_visible ? (
              <Eye className="size-3.5 text-emerald-600" />
            ) : (
              <EyeOff className="size-3.5 text-slate-400" />
            )}
            <span>{block.is_visible ? "Отображается" : "Скрыта"}</span>
          </button>

          {!protectedBlock && (
            <button
              type="button"
              onClick={onDelete}
              className="peak-admin__icon-button peak-admin__icon-button--danger"
              title="Удалить блок"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Поля блока */}
      <div className="p-4 sm:p-6 space-y-5">
        {block.template.type === "home_work_cases" ? (
          <HomeCasesEditor
            initialAvailableCases={availableCases}
            value={stringValue(block.content.selectedHrefs)}
            onChange={(val) => onChange("selectedHrefs", val)}
          />
        ) : block.template.type === "cases_grid" ? (
          <CasesGridEditor
            block={block}
            initialAvailableCases={availableCases}
            onContentChange={onChange}
          />
        ) : editableFields.length > 0 ? (
          editableFields.map((field) => (
            <FieldEditor
              key={field.name}
              block={block}
              field={field}
              onContentChange={onChange}
              uploadFolder={uploadFolder}
            />
          ))
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="block font-semibold text-slate-700 mb-1">Готовая системная секция</span>
            <span>
              {formatTypography(
                "Внутренняя вёрстка секции защищена. Её можно перемещать и скрывать кнопкой с глазом.",
              )}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function PageEditor({
  availableCases,
  initialBlocks,
  initialPage,
  templates,
}: {
  availableCases?: CaseItem[];
  initialBlocks: CmsEditorBlock[];
  initialPage: CmsPage;
  templates: CmsBlockTemplate[];
}) {
  const [page, setPage] = useState({
    title: initialPage.title,
    slug: initialPage.slug,
    status: initialPage.status,
    seoTitle: initialPage.seo_title,
    seoDescription: initialPage.seo_description,
  });
  const [blocks, setBlocks] = useState(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(initialBlocks[0]?.id || null);
  const [dirty, setDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [removedBlocks, setRemovedBlocks] = useState<CmsEditorBlock[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /* ─── Auto-save ─── */
  const [localDraft, setLocalDraft] = useState<LocalDraft | null>(null);
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const draft = loadDraft(initialPage.id);
    if (!draft) return;

    const serverSnapshot = JSON.stringify({
      page: {
        title: initialPage.title,
        slug: initialPage.slug,
        status: initialPage.status,
        seoTitle: initialPage.seo_title,
        seoDescription: initialPage.seo_description,
      },
      blockIds: initialBlocks.map((b) => b.id).join(","),
    });
    const draftSnapshot = JSON.stringify({
      page: draft.page,
      blockIds: draft.blocks.map((b) => b.id).join(","),
    });

    if (serverSnapshot !== draftSnapshot) {
      setLocalDraft(draft);
      setDraftBannerVisible(true);
    } else {
      clearDraft(initialPage.id);
    }
  }, [initialPage, initialBlocks]);

  const scheduleDraftSave = useCallback(
    (currentPage: typeof page, currentBlocks: CmsEditorBlock[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const draft: LocalDraft = {
          savedAt: new Date().toISOString(),
          page: currentPage,
          blocks: currentBlocks.map((b) => ({
            id: b.id,
            block_id: b.block_id,
            page_id: b.page_id,
            sort_order: b.sort_order,
            content: b.content as Record<string, string>,
            is_visible: b.is_visible,
            template: b.template,
          })),
        };
        saveDraft(initialPage.id, draft);
        setAutoSavedAt(new Date());
      }, 1500);
    },
    [initialPage.id],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const activeBlock = blocks.find((block) => block.id === activeBlockId) || blocks[0];
  const isCasePage = initialPage.page_kind === "case";
  const addressLocked = initialPage.is_system || isCasePage;
  const caseContentBlock = isCasePage ? blocks.find((block) => block.template.type === "case_page") : undefined;
  const caseSlug = initialPage.route_path.replace(/^\/cases\//, "");

  function updatePage<Key extends keyof typeof page>(key: Key, value: (typeof page)[Key]) {
    const nextPage = { ...page, [key]: value };
    setPage(nextPage);
    setDirty(true);
    scheduleDraftSave(nextPage, blocks);
  }

  function updateBlock(id: string, name: string, value: string) {
    let nextBlocks: CmsEditorBlock[] = [];
    setBlocks((current) => {
      nextBlocks = current.map((block) =>
        block.id === id ? { ...block, content: { ...block.content, [name]: value } } : block,
      );
      return nextBlocks;
    });
    setDirty(true);
    setTimeout(() => scheduleDraftSave(page, nextBlocks), 0);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    let nextBlocks: CmsEditorBlock[] = [];
    setBlocks((current) => {
      const oldIndex = current.findIndex((block) => block.id === active.id);
      const newIndex = current.findIndex((block) => block.id === over.id);
      nextBlocks = arrayMove(current, oldIndex, newIndex);
      return nextBlocks;
    });
    setDirty(true);
    setTimeout(() => scheduleDraftSave(page, nextBlocks), 0);
  }

  function addBlock(template: CmsBlockTemplate) {
    const block: CmsEditorBlock = {
      id: crypto.randomUUID(),
      page_id: initialPage.id,
      block_id: template.id,
      sort_order: blocks.length,
      content: { ...template.default_content },
      is_visible: true,
      template,
    };
    const nextBlocks = [...blocks, block];
    setBlocks(nextBlocks);
    setActiveBlockId(block.id);
    setAddOpen(false);
    setDirty(true);
    scheduleDraftSave(page, nextBlocks);
  }

  function deleteBlock(block: CmsEditorBlock) {
    const nextBlocks = blocks.filter((item) => item.id !== block.id);
    setBlocks(nextBlocks);
    setRemovedBlocks((current) => [...current, block]);
    if (activeBlockId === block.id) setActiveBlockId(nextBlocks[0]?.id || null);
    setDirty(true);
    scheduleDraftSave(page, nextBlocks);
  }

  function restoreRemovedBlock(block: CmsEditorBlock) {
    setRemovedBlocks((current) => current.filter((item) => item.id !== block.id));
    const nextBlocks = [...blocks, block];
    setBlocks(nextBlocks);
    setActiveBlockId(block.id);
    setDirty(true);
    scheduleDraftSave(page, nextBlocks);
  }

  function handleRestoreDraft() {
    if (!localDraft) return;
    setPage(localDraft.page);

    const templateById = new Map(templates.map((t) => [t.id, t]));
    const restoredBlocks: CmsEditorBlock[] = localDraft.blocks.flatMap((b) => {
      const template = templateById.get(b.block_id) ?? b.template;
      if (!template) return [];
      return [
        {
          id: b.id,
          page_id: b.page_id,
          block_id: b.block_id,
          sort_order: b.sort_order,
          content: b.content,
          is_visible: b.is_visible,
          template,
        },
      ];
    });

    setBlocks(restoredBlocks);
    setActiveBlockId(restoredBlocks[0]?.id || null);
    setDirty(true);
    setDraftBannerVisible(false);
    setLocalDraft(null);
  }

  function handleDiscardDraft() {
    clearDraft(initialPage.id);
    setLocalDraft(null);
    setDraftBannerVisible(false);
  }

  function handleRestoreRevision(revision: CmsPageRevision) {
    setPage({
      title: revision.title,
      slug: revision.slug,
      status: revision.status,
      seoTitle: revision.seo_title || "",
      seoDescription: revision.seo_description || "",
    });

    const templateById = new Map(templates.map((t) => [t.id, t]));
    const restoredBlocks: CmsEditorBlock[] = (revision.blocks || []).flatMap((revBlock, idx) => {
      const template = templateById.get(revBlock.blockId);
      if (!template) return [];
      return [
        {
          id: revBlock.id || crypto.randomUUID(),
          page_id: initialPage.id,
          block_id: revBlock.blockId,
          sort_order: idx,
          content: revBlock.content || {},
          is_visible: revBlock.isVisible !== false,
          template,
        },
      ];
    });

    setBlocks(restoredBlocks);
    setActiveBlockId(restoredBlocks[0]?.id || null);
    setDirty(true);
    setMessage({
      type: "success",
      text: `Версия от ${new Date(revision.created_at).toLocaleString("ru-RU")} загружена в редактор. Нажмите «Сохранить» для применения.`,
    });
  }

  function persistPage(nextPage: typeof page, successMessage?: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await savePageAction({
        id: initialPage.id,
        ...nextPage,
        routePath: initialPage.route_path,
        isSystem: initialPage.is_system,
        blocks: blocks.map((block) => ({
          id: block.id,
          blockId: block.block_id,
          content: block.content,
          isVisible: block.is_visible,
        })),
      });
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setPage(nextPage);
      setDirty(false);
      clearDraft(initialPage.id);
      setAutoSavedAt(null);
      setDraftBannerVisible(false);
      setMessage({ type: "success", text: successMessage || result.success || "Изменения сохранены." });
      router.refresh();
    });
  }

  const isPublished = page.status === "published";

  return (
    <main className="peak-admin__main">
      {/* Плавающий топбар редактора в стиле Vercel — Light */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={isCasePage ? "/admin/cases" : "/admin"}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>{isCasePage ? "Кейсы" : "Страницы"}</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono text-slate-500">{initialPage.route_path}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {formatTypography(page.title)}
            </h1>
            <span
              className={`peak-admin__badge ${
                isPublished ? "peak-admin__badge--published" : "peak-admin__badge--draft"
              }`}
            >
              <span>{isPublished ? "Опубликована" : "Черновик"}</span>
            </span>
          </div>

          {autoSavedAt && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>
                Автосохранено локально в{" "}
                {autoSavedAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
          )}
        </div>

        {/* Группа кнопок действий */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* История версий */}
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="peak-admin__button peak-admin__button--outline !h-9 !text-xs"
            title="История версий страницы"
          >
            <History className="size-3.5" />
            <span>История</span>
          </button>

          {/* Настройки SEO */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="peak-admin__button peak-admin__button--outline !h-9 !text-xs"
            title="Настройки SEO и адреса"
          >
            <Settings className="size-3.5" />
            <span>Настройки</span>
          </button>

          {/* Открыть на сайте */}
          {isPublished && (
            <Link
              href={initialPage.route_path}
              target="_blank"
              className="peak-admin__button peak-admin__button--outline !h-9 !text-xs"
              title="Открыть на сайте"
            >
              <ExternalLink className="size-3.5" />
              <span>Сайт</span>
            </Link>
          )}

          {/* Опубликовать / Сохранить */}
          {!initialPage.is_system && !isPublished && (
            <button
              type="button"
              onClick={() => persistPage({ ...page, status: "published" })}
              disabled={pending}
              className="peak-admin__button peak-admin__button--outline !h-9 !text-xs"
            >
              <Send className="size-3.5 text-orange-600" />
              <span>Опубликовать</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => persistPage(page)}
            disabled={pending || (!dirty && !pending)}
            className="peak-admin__button peak-admin__button--primary !h-9 !text-xs shadow-xs"
          >
            {pending ? (
              <>
                <Save className="size-3.5 animate-pulse" />
                <span>Сохраняем…</span>
              </>
            ) : dirty ? (
              <>
                <Save className="size-3.5" />
                <span>Сохранить</span>
              </>
            ) : (
              <>
                <Check className="size-3.5 text-white" />
                <span>Сохранено</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Баннер восстановления локального черновика */}
      {draftBannerVisible && localDraft && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <CloudOff className="size-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold block">Найден локальный черновик</span>
              <span className="text-amber-800">
                Сохранён в браузере {new Date(localDraft.savedAt).toLocaleString("ru-RU")}.
                Восстановить в редактор?
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="peak-admin__button peak-admin__button--primary !h-7 !text-xs"
            >
              Восстановить
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="peak-admin__button peak-admin__button--outline !h-7 !text-xs"
            >
              Сбросить
            </button>
          </div>
        </div>
      )}

      {/* Уведомление о сохранении/ошибке */}
      {message && (
        <div
          className={`peak-admin__notice ${
            message.type === "error" ? "peak-admin__notice--error" : "peak-admin__notice--success"
          }`}
          role="status"
        >
          <span>{formatTypography(message.text)}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-70 hover:opacity-100"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
      )}

      {/* Двухколоночный конструктор блоков — Light */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Левая колонка (Список секций / Drag & Drop) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
                <Layers className="size-3.5 text-orange-600" />
                <span>Секции страницы</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{blocks.length}</span>
            </div>

            <DndContext
              id={`page-blocks-${initialPage.id}`}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5" role="tablist">
                  {blocks.map((block, index) => (
                    <SortableSectionTab
                      key={block.id}
                      active={activeBlock?.id === block.id}
                      block={block}
                      index={index}
                      onSelect={() => setActiveBlockId(block.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Кнопка добавления нового блока */}
            {!isCasePage && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <Plus className="size-3.5" />
                <span>Добавить секцию</span>
              </button>
            )}
          </div>

          {/* Восстановление удалённых блоков до сохранения */}
          {removedBlocks.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-medium text-slate-600 block">
                Удалённые блоки ({removedBlocks.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {removedBlocks.map((blk) => (
                  <button
                    key={blk.id}
                    type="button"
                    onClick={() => restoreRemovedBlock(blk)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-md text-[11px] transition-colors shadow-xs"
                  >
                    <RotateCcw className="size-3" />
                    <span>{formatTypography(blk.template.name)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Если кейс — галерея кейса */}
          {isCasePage && caseContentBlock && (
            <div className="mt-4">
              <CaseMediaEditor
                slug={caseSlug}
                value={stringValue(caseContentBlock.content.gallery)}
                onChange={(value) => updateBlock(caseContentBlock.id, "gallery", value)}
              />
            </div>
          )}
        </div>

        {/* Правая колонка (Редактирование активного блока) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            {activeBlock && (
              <motion.div
                key={activeBlock.id}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <BlockEditorPanel
                  availableCases={availableCases}
                  block={activeBlock}
                  protectedBlock={initialPage.is_system || isCasePage}
                  uploadFolder={isCasePage ? "cases" : "pages"}
                  onToggleVisible={() => {
                    let nextBlocks: CmsEditorBlock[] = [];
                    setBlocks((current) => {
                      nextBlocks = current.map((item) =>
                        item.id === activeBlock.id ? { ...item, is_visible: !item.is_visible } : item,
                      );
                      return nextBlocks;
                    });
                    setDirty(true);
                    setTimeout(() => scheduleDraftSave(page, nextBlocks), 0);
                  }}
                  onDelete={() => deleteBlock(activeBlock)}
                  onChange={(name, value) => updateBlock(activeBlock.id, name, value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Модальное окно настроек страницы (SEO & URL) — Light */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="peak-admin__modal-backdrop" role="presentation">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-modal-title"
              className="peak-admin__modal-card !max-w-xl bg-white"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="peak-admin__modal-header">
                <div>
                  <h2 id="settings-modal-title" className="text-base font-semibold text-slate-900">
                    Настройки {isCasePage ? "кейса" : "страницы"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatTypography("Название, адрес, статус публикации и метаданные для поиска.")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  aria-label="Закрыть"
                  className="peak-admin__icon-button"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="peak-admin__modal-body space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Название страницы
                  </label>
                  <input
                    value={page.title}
                    onChange={(event) => updatePage("title", event.target.value)}
                    maxLength={160}
                    className="peak-admin__input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Адрес (URL Slug)
                  </label>
                  {addressLocked ? (
                    <div className="px-3 py-2 text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded-lg">
                      {initialPage.route_path}
                    </div>
                  ) : (
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-orange-500">
                      <span className="px-3 py-2 text-xs font-mono text-slate-500 bg-slate-100 border-r border-slate-200">
                        /
                      </span>
                      <input
                        value={page.slug}
                        onChange={(event) =>
                          updatePage("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                        className="flex-1 px-3 py-2 text-xs font-mono text-slate-900 bg-transparent border-0 outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Статус публикации
                  </label>
                  <select
                    value={page.status}
                    disabled={initialPage.is_system}
                    onChange={(event) => updatePage("status", event.target.value as CmsPageStatus)}
                    className="peak-admin__select"
                  >
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликована</option>
                  </select>
                </div>

                {/* Блок SEO */}
                <div className="pt-3 border-t border-slate-200 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        SEO Заголовок (Title)
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        {page.seoTitle.length}/60 знаков
                      </span>
                    </div>
                    <input
                      value={page.seoTitle}
                      onChange={(event) => updatePage("seoTitle", event.target.value)}
                      maxLength={160}
                      className="peak-admin__input"
                      placeholder="Заголовок для поисковых систем"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        SEO Описание (Description)
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        {page.seoDescription.length}/160 знаков
                      </span>
                    </div>
                    <textarea
                      value={page.seoDescription}
                      onChange={(event) => updatePage("seoDescription", event.target.value)}
                      maxLength={320}
                      rows={3}
                      className="peak-admin__textarea"
                      placeholder="Краткое описание страницы для сниппета в Google/Yandex"
                    />
                  </div>
                </div>
              </div>

              <div className="peak-admin__modal-footer">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="peak-admin__button peak-admin__button--primary"
                >
                  Готово
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Модальное окно добавления секции — Light */}
      <AnimatePresence>
        {addOpen && (
          <div className="peak-admin__modal-backdrop" role="presentation">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-block-title"
              className="peak-admin__modal-card !max-w-2xl bg-white"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="peak-admin__modal-header">
                <div>
                  <h2 id="add-block-title" className="text-base font-semibold text-slate-900">
                    Добавить секцию
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Выберите тип секции для добавления на страницу.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  aria-label="Закрыть"
                  className="peak-admin__icon-button"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="peak-admin__modal-body max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => addBlock(template)}
                    className="p-3.5 text-left bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-xl transition-all group"
                  >
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 block">
                      {formatTypography(template.name)}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1 leading-relaxed">
                      {formatTypography(template.description)}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Модальное окно истории версий */}
      <RevisionHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        pageId={initialPage.id}
        onRestoreRevision={handleRestoreRevision}
      />
    </main>
  );
}
