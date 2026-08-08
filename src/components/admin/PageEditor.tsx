"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  ChevronUp,
  CloudOff,
  Eye,
  EyeOff,
  GripVertical,
  History,
  ImageUp,
  Plus,
  RotateCcw,
  Save,
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
  savedAt: string;            // ISO-timestamp
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

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // черновик живёт 7 дней

function draftKey(pageId: string) {
  return `peak-draft:${pageId}`;
}

function loadDraft(pageId: string): LocalDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftKey(pageId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as LocalDraft;
    // Удаляем черновик старше 7 дней
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
    // localStorage недоступен (private mode, quota exceeded) — молча игнорируем
  }
}

function clearDraft(pageId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(draftKey(pageId));
  } catch { /* noop */ }
}

/* ─── Вспомогательные компоненты ─── */

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
  const commonClassName = "peak-admin__input";

  if (field.type === "media") {
    return (
      <section className="peak-admin__media-field">
        <div className="mb-4 flex items-start gap-3">
          <span className="peak-admin__media-field-icon">
            <ImageUp className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="peak-admin__settings-title">
              {formatTypography(field.label)}{field.required ? <span className="peak-admin__required"> *</span> : null}
            </h3>
            <p className="peak-admin__section-description">
              Загрузите фото или видео. После загрузки обязательно сохраните страницу.
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
      </section>
    );
  }

  return (
    <label className="peak-admin__field">
      <span className="peak-admin__label">
        {formatTypography(field.label)}{field.required ? <span className="peak-admin__required"> *</span> : null}
      </span>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onContentChange(field.name, event.target.value)}
          required={field.required}
          rows={5}
          maxLength={10_000}
          className="peak-admin__textarea"
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(event) => onContentChange(field.name, event.target.value)}
          required={field.required}
          className="peak-admin__select"
        >
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
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
          className={commonClassName}
          placeholder={field.type === "url" ? "https://… или /contacts" : undefined}
        />
      )}
    </label>
  );
}

function SortableBlock({
  availableCases,
  block,
  expanded,
  protectedBlock,
  uploadFolder,
  onChange,
  onDelete,
  onToggleExpanded,
  onToggleVisible,
}: {
  availableCases?: CaseItem[];
  block: CmsEditorBlock;
  expanded: boolean;
  protectedBlock: boolean;
  uploadFolder: "pages" | "cases";
  onChange: (name: string, value: string) => void;
  onDelete: () => void;
  onToggleExpanded: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const automaticMediaTypeFields = new Set(
    block.template.fields.flatMap((field) => field.mediaTypeField ? [field.mediaTypeField] : []),
  );
  const editableFields = block.template.fields
    .filter((field) => !automaticMediaTypeFields.has(field.name))
    .sort((left, right) => Number(right.type === "media") - Number(left.type === "media"));
  const hasMedia = editableFields.some((field) => field.type === "media");

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`peak-admin__block ${isDragging ? "peak-admin__block--dragging" : ""} ${block.is_visible ? "" : "peak-admin__block--hidden"}`}
    >
      <div className="peak-admin__block-header">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Перетащить блок ${block.template.name}`}
          className="peak-admin__drag-handle"
        >
          <GripVertical className="size-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={onToggleExpanded} className="peak-admin__block-main">
          <span className="flex items-center gap-2">
            <span className="peak-admin__block-title truncate">{formatTypography(block.template.name)}</span>
            {hasMedia && (
              <span className="peak-admin__media-tag">
                Медиа
              </span>
            )}
          </span>
          <span className="peak-admin__block-description">
            {formatTypography(stringValue(block.content.title) || stringValue(block.content.heading) || block.template.description)}
          </span>
        </button>
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={block.is_visible ? "Скрыть блок" : "Показать блок"}
          className="peak-admin__icon-button"
        >
          {block.is_visible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
        </button>
        {!protectedBlock && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Удалить блок"
            className="peak-admin__icon-button peak-admin__icon-button--danger"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-label={expanded ? "Свернуть форму" : "Открыть форму"}
          className="peak-admin__icon-button"
        >
          {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </button>
      </div>
      {expanded && (
        <div className="peak-admin__block-body">
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
              <FieldEditor key={field.name} block={block} field={field} onContentChange={onChange} uploadFolder={uploadFolder} />
            ))
          ) : (
            <div className="peak-admin__protected">
              <span className="block font-semibold" style={{ color: "var(--peak-ink)" }}>Готовая секция</span>
              <span className="mt-0.5 block">
                Внутренняя вёрстка защищена. Секцию можно перемещать и скрывать кнопкой с глазом.
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ─── Баннер восстановления черновика ─── */
function DraftRestoreBanner({
  draft,
  onRestore,
  onDiscard,
}: {
  draft: LocalDraft;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  const savedAt = new Date(draft.savedAt).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        padding: "0.75rem 1rem",
        marginBottom: "1rem",
        background: "var(--peak-warning-soft)",
        border: "1px solid rgba(138, 75, 8, 0.2)",
        borderLeft: "3px solid var(--peak-warning)",
        flexWrap: "wrap",
      }}
    >
      <CloudOff
        className="size-4 shrink-0"
        style={{ color: "var(--peak-warning)" }}
        aria-hidden="true"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--peak-ink)" }}>
          Найден несохранённый черновик
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--peak-muted)", display: "block" }}>
          Сохранён локально {savedAt}. Восстановить?
        </span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
        <button
          type="button"
          onClick={onRestore}
          className="peak-admin__button peak-admin__button--dark"
          style={{ fontSize: "0.75rem" }}
        >
          Восстановить
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="peak-admin__button peak-admin__button--outline"
          style={{ fontSize: "0.75rem" }}
        >
          Удалить черновик
        </button>
      </div>
    </div>
  );
}

/* ─── Индикатор автосохранения ─── */
function AutoSaveIndicator({ savedAt }: { savedAt: Date | null }) {
  if (!savedAt) return null;

  const time = savedAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <span
      aria-live="polite"
      style={{
        fontSize: "0.6875rem",
        color: "var(--peak-muted)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        userSelect: "none",
      }}
      title={`Черновик сохранён в браузере в ${time}`}
    >
      <span
        style={{
          display: "inline-block",
          width: "0.375rem",
          height: "0.375rem",
          background: "var(--peak-green)",
          borderRadius: "50%",
        }}
      />
      Черновик сохранён в {time}
    </span>
  );
}

/* ─── Главный компонент ─── */

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
  const [expandedId, setExpandedId] = useState<string | null>(initialBlocks[0]?.id || null);
  const [dirty, setDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /* ─── Auto-save state ─── */
  const [localDraft, setLocalDraft] = useState<LocalDraft | null>(null);     // черновик из localStorage
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);        // показать баннер
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);         // время последнего автосохранения
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Загрузка черновика при монтировании ─── */
  useEffect(() => {
    const draft = loadDraft(initialPage.id);
    if (!draft) return;

    // Показываем баннер только если данные отличаются от серверных
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
      // Черновик совпадает с сервером — удаляем его
      clearDraft(initialPage.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Дебаунс-автосохранение при изменениях ─── */
  const scheduleDraftSave = useCallback((
    currentPage: typeof page,
    currentBlocks: CmsEditorBlock[],
  ) => {
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
  }, [initialPage.id]);

  /* ─── Cleanup debounce on unmount ─── */
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /* ─── Предупреждение при закрытии/переходе с несохранёнными данными ─── */
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const visibleCount = useMemo(() => blocks.filter((block) => block.is_visible).length, [blocks]);
  const isCasePage = initialPage.page_kind === "case";
  const addressLocked = initialPage.is_system || isCasePage;
  const caseContentBlock = isCasePage ? blocks.find((block) => block.template.type === "case_page") : undefined;
  const caseSlug = initialPage.route_path.replace(/^\/cases\//, "");

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [removedBlocks, setRemovedBlocks] = useState<CmsEditorBlock[]>([]);

  function updatePage<Key extends keyof typeof page>(key: Key, value: (typeof page)[Key]) {
    const nextPage = { ...page, [key]: value };
    setPage(nextPage);
    setDirty(true);
    scheduleDraftSave(nextPage, blocks);
  }

  function updateBlock(id: string, name: string, value: string) {
    let nextBlocks: CmsEditorBlock[] = [];
    setBlocks((current) => {
      nextBlocks = current.map((block) => (
        block.id === id ? { ...block, content: { ...block.content, [name]: value } } : block
      ));
      return nextBlocks;
    });
    setDirty(true);
    // Используем setTimeout чтобы дать setBlocks примениться
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
    setExpandedId(block.id);
    setAddOpen(false);
    setDirty(true);
    scheduleDraftSave(page, nextBlocks);
  }

  function deleteBlock(block: CmsEditorBlock) {
    const nextBlocks = blocks.filter((item) => item.id !== block.id);
    setBlocks(nextBlocks);
    setRemovedBlocks((current) => [...current, block]);
    if (expandedId === block.id) setExpandedId(null);
    setDirty(true);
    scheduleDraftSave(page, nextBlocks);
  }

  function restoreRemovedBlock(block: CmsEditorBlock) {
    setRemovedBlocks((current) => current.filter((item) => item.id !== block.id));
    const nextBlocks = [...blocks, block];
    setBlocks(nextBlocks);
    setExpandedId(block.id);
    setDirty(true);
    scheduleDraftSave(page, nextBlocks);
  }

  /* ─── Восстановление черновика из баннера ─── */
  function handleRestoreDraft() {
    if (!localDraft) return;
    setPage(localDraft.page);

    const templateById = new Map(templates.map((t) => [t.id, t]));
    const restoredBlocks: CmsEditorBlock[] = localDraft.blocks.flatMap((b) => {
      const template = templateById.get(b.block_id) ?? b.template;
      if (!template) return [];
      return [{
        id: b.id,
        page_id: b.page_id,
        block_id: b.block_id,
        sort_order: b.sort_order,
        content: b.content,
        is_visible: b.is_visible,
        template,
      }];
    });

    setBlocks(restoredBlocks);
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
    setDirty(true);
    setMessage({
      type: "success",
      text: `Версия от ${new Date(revision.created_at).toLocaleString("ru-RU")} загружена в редактор. Нажмите «Сохранить» для применения.`,
    });
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await savePageAction({
        id: initialPage.id,
        ...page,
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
      setDirty(false);
      // Очищаем локальный черновик — данные уже на сервере
      clearDraft(initialPage.id);
      setAutoSavedAt(null);
      setDraftBannerVisible(false);
      setMessage({ type: "success", text: result.success || "Изменения сохранены." });
      router.refresh();
    });
  }

  return (
    <main className="peak-admin__main">
      {/* Навигация назад */}
      <Link href={isCasePage ? "/admin/cases" : "/admin"} className="peak-admin__back">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {isCasePage ? "Все кейсы" : "Все страницы"}
      </Link>

      {/* Компактный заголовок страницы */}
      <div className="peak-admin__page-header">
        <div>
          <h1 className="peak-admin__page-title">
            {isCasePage ? "Редактор кейса" : "Редактор страницы"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
            <p className="peak-admin__page-meta" style={{ margin: 0 }}>{blocks.length} блоков · {visibleCount} видно на сайте</p>
            <AutoSaveIndicator savedAt={autoSavedAt} />
          </div>
        </div>
        <div className="peak-admin__page-header-actions">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="peak-admin__button peak-admin__button--outline"
            title="История версий"
          >
            <History className="size-3.5" aria-hidden="true" />
            История
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="peak-admin__button peak-admin__button--outline"
            title="Настройки страницы"
          >
            <Settings className="size-3.5" aria-hidden="true" />
            Настройки
          </button>
          {page.status === "published" && (
            <Link
              href={initialPage.route_path}
              target="_blank"
              className="peak-admin__button peak-admin__button--outline"
            >
              Открыть
            </Link>
          )}
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="peak-admin__button peak-admin__button--primary"
          >
            {pending ? <Save className="size-4 animate-pulse" /> : <Check className="size-4" />}
            {pending ? "Сохраняем…" : dirty ? "Сохранить" : "Сохранено"}
          </button>
        </div>
      </div>

      {/* Баннер восстановления черновика */}
      {draftBannerVisible && localDraft && (
        <DraftRestoreBanner
          draft={localDraft}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {message && (
        <p role="status" className={`peak-admin__notice ${message.type === "error" ? "peak-admin__notice--error" : "peak-admin__notice--success"}`}>
          {formatTypography(message.text)}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Левая колонка — Содержание и блоки (75% ширины) */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="peak-admin__section-title !mt-0">{isCasePage ? "Содержание кейса" : "Секции страницы"}</h2>
              <p className="peak-admin__section-description">
                {isCasePage ? "Откройте блок и заполните понятные поля проекта." : "Перетаскивайте за ручку слева, чтобы изменить порядок."}
              </p>
            </div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <div className="peak-admin__block-list">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    availableCases={availableCases}
                    block={block}
                    expanded={expandedId === block.id}
                    protectedBlock={initialPage.is_system || isCasePage}
                    uploadFolder={isCasePage ? "cases" : "pages"}
                    onToggleExpanded={() => setExpandedId((current) => current === block.id ? null : block.id)}
                    onToggleVisible={() => {
                      let nextBlocks: CmsEditorBlock[] = [];
                      setBlocks((current) => {
                        nextBlocks = current.map((item) => item.id === block.id ? { ...item, is_visible: !item.is_visible } : item);
                        return nextBlocks;
                      });
                      setDirty(true);
                      setTimeout(() => scheduleDraftSave(page, nextBlocks), 0);
                    }}
                    onDelete={() => deleteBlock(block)}
                    onChange={(name, value) => updateBlock(block.id, name, value)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {removedBlocks.length > 0 && (
            <div style={{ marginTop: "0.75rem", padding: "0.875rem", border: "1px dashed var(--peak-line-strong)", background: "var(--peak-bg)" }}>
              <h3 style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--peak-muted)", display: "flex", alignItems: "center", gap: "0.375rem", margin: 0 }}>
                <Trash2 className="size-3.5" aria-hidden="true" />
                Удалённые блоки ({removedBlocks.length})
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--peak-muted)", margin: "0.25rem 0 0" }}>
                Нажмите «Восстановить», чтобы вернуть блок в редактор до сохранения.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.5rem" }}>
                {removedBlocks.map((blk) => (
                  <button
                    key={blk.id}
                    type="button"
                    onClick={() => restoreRemovedBlock(blk)}
                    className="peak-admin__button peak-admin__button--outline"
                    style={{ fontSize: "0.75rem" }}
                  >
                    <RotateCcw className="size-3" aria-hidden="true" />
                    Восстановить «{formatTypography(blk.template.name)}»
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCasePage && caseContentBlock && (
            <CaseMediaEditor
              slug={caseSlug}
              value={stringValue(caseContentBlock.content.gallery)}
              onChange={(value) => updateBlock(caseContentBlock.id, "gallery", value)}
            />
          )}

          {!isCasePage && <div className="peak-admin__add">
            <button
              type="button"
              onClick={() => setAddOpen((current) => !current)}
              className="peak-admin__button peak-admin__add-trigger"
            >
              <Plus className="size-5" aria-hidden="true" />
              Добавить блок
            </button>
            {addOpen && (
              <div className="peak-admin__add-menu">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => addBlock(template)}
                    className="peak-admin__template"
                  >
                    <span className="peak-admin__block-title block">{formatTypography(template.name)}</span>
                    <span className="peak-admin__section-description block">{formatTypography(template.description)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>}
        </section>

        {/* Правая колонка — Закрепленная панель настроек (Sticky Cockpit Sidebar) */}
        <aside className="lg:col-span-4 xl:col-span-3 sticky top-16 space-y-4">
          <div className="bg-white border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Settings className="size-4 text-[#FD4B32]" />
                Настройки {isCasePage ? "кейса" : "страницы"}
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                  page.status === "published"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {page.status === "published" ? "Опубликована" : "Черновик"}
              </span>
            </div>

            <label className="peak-admin__field">
              <span className="peak-admin__label">Статус публикации</span>
              <select
                value={page.status}
                disabled={initialPage.is_system}
                onChange={(event) => updatePage("status", event.target.value as CmsPageStatus)}
                className="peak-admin__select"
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликована</option>
              </select>
            </label>

            <label className="peak-admin__field">
              <span className="peak-admin__label">Название</span>
              <input
                value={page.title}
                onChange={(event) => updatePage("title", event.target.value)}
                maxLength={160}
                className="peak-admin__input"
              />
            </label>

            <label className="peak-admin__field">
              <span className="peak-admin__label">Адрес страницы</span>
              {addressLocked ? (
                <div className="peak-admin__locked-field text-xs truncate">
                  {initialPage.route_path}
                </div>
              ) : (
                <div className="peak-admin__url-field">
                  <span className="peak-admin__url-prefix">/</span>
                  <input
                    value={page.slug}
                    onChange={(event) => updatePage("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="peak-admin__inline-input"
                  />
                </div>
              )}
            </label>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                SEO параметры
              </span>
              <label className="peak-admin__field">
                <span className="peak-admin__label">SEO Заголовок</span>
                <input
                  value={page.seoTitle}
                  onChange={(event) => updatePage("seoTitle", event.target.value)}
                  maxLength={160}
                  className="peak-admin__input"
                />
              </label>
              <label className="peak-admin__field">
                <span className="peak-admin__label">SEO Описание</span>
                <textarea
                  value={page.seoDescription}
                  onChange={(event) => updatePage("seoDescription", event.target.value)}
                  maxLength={320}
                  rows={3}
                  className="peak-admin__textarea"
                />
              </label>
            </div>

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={save}
                disabled={pending || !dirty}
                className="peak-admin__button peak-admin__button--primary w-full justify-center"
              >
                {pending ? <Save className="size-4 animate-pulse" /> : <Check className="size-4" />}
                {pending ? "Сохраняем…" : dirty ? "Сохранить изменения" : "Сохранено"}
              </button>
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="peak-admin__button peak-admin__button--outline w-full justify-center text-xs"
              >
                <History className="size-3.5" aria-hidden="true" />
                История версий
              </button>
            </div>
          </div>
        </aside>
      </div>

      <RevisionHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        pageId={initialPage.id}
        onRestoreRevision={handleRestoreRevision}
      />

      {settingsOpen && (
        <div className="peak-admin__modal-backdrop" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
            className="peak-admin__modal !max-w-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="settings-modal-title" className="peak-admin__modal-title">Настройки страницы</h2>
                <p className="peak-admin__modal-copy">
                  Навание страницы, адрес, статус публикации и настройки для поиска.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Закрыть"
                className="peak-admin__icon-button"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="peak-admin__field">
                <span className="peak-admin__label">Название</span>
                <input
                  value={page.title}
                  onChange={(event) => updatePage("title", event.target.value)}
                  maxLength={160}
                  className="peak-admin__input"
                />
              </label>

              <label className="peak-admin__field">
                <span className="peak-admin__label">Адрес</span>
                {addressLocked ? (
                  <div className="peak-admin__locked-field">
                    {initialPage.route_path}
                  </div>
                ) : (
                  <div className="peak-admin__url-field">
                    <span className="peak-admin__url-prefix">/</span>
                    <input
                      value={page.slug}
                      onChange={(event) => updatePage("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="peak-admin__inline-input"
                    />
                  </div>
                )}
              </label>

              <label className="peak-admin__field">
                <span className="peak-admin__label">Статус</span>
                <select
                  value={page.status}
                  disabled={initialPage.is_system}
                  onChange={(event) => updatePage("status", event.target.value as CmsPageStatus)}
                  className="peak-admin__select"
                >
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликована</option>
                </select>
                {initialPage.is_system && (
                  <span className="peak-admin__section-description block text-xs mt-1">
                    Встроенная страница всегда опубликована. Отдельные секции можно скрывать кнопкой с глазом.
                  </span>
                )}
              </label>

              <details className="peak-admin__settings-card" style={{ marginTop: "1rem" }} open>
                <summary style={{ fontWeight: 600, color: "var(--peak-ink)", cursor: "pointer" }}>Настройки для поиска</summary>
                <div className="mt-4 space-y-4">
                  <label className="peak-admin__field">
                    <span className="peak-admin__label">Заголовок SEO</span>
                    <input
                      value={page.seoTitle}
                      onChange={(event) => updatePage("seoTitle", event.target.value)}
                      maxLength={160}
                      className="peak-admin__input"
                    />
                  </label>
                  <label className="peak-admin__field">
                    <span className="peak-admin__label">Описание SEO</span>
                    <textarea
                      value={page.seoDescription}
                      onChange={(event) => updatePage("seoDescription", event.target.value)}
                      maxLength={320}
                      rows={3}
                      className="peak-admin__textarea"
                    />
                  </label>
                </div>
              </details>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="peak-admin__button peak-admin__button--primary"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
