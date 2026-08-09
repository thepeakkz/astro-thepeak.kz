"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/supabase/auth";
import { parseCaseGallery } from "@/lib/case-gallery";
import { getLeads } from "@/lib/leads";
import { LEAD_STATUSES, type LeadStatus } from "@/types/leads";

export type AdminActionResult = {
  error?: string;
  success?: string;
  id?: string;
};

const pageInputSchema = z.object({
  title: z.string().trim().min(1, "Укажите название страницы.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите адрес страницы.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Используйте латинские буквы, цифры и дефисы.")
    .refine(
      (slug) => !["admin", "api", "cases", "gallery", "privacy", "services", "site-development", "team", "web"].includes(slug),
      "Этот адрес занят системной страницей.",
    ),
});

const caseInputSchema = z.object({
  title: z.string().trim().min(1, "Укажите название кейса.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите адрес кейса.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Используйте латинские буквы, цифры и дефисы."),
});

const leadStatusSchema = z.enum(LEAD_STATUSES);
const leadFiltersSchema = z.object({
  status: leadStatusSchema.optional(),
  search: z.string().trim().max(100).optional(),
  page: z.number().int().positive(),
});

const blockContentSchema = z
  .record(z.string().max(80), z.string().max(100_000))
  .superRefine((content, context) => {
    Object.entries(content).forEach(([key, value]) => {
      if (key === "gallery") {
        if (value && parseCaseGallery(value) === undefined) {
          context.addIssue({ code: "custom", message: "Некорректный список медиа кейса." });
        }
        return;
      }
      if (value.length > 10_000) {
        context.addIssue({ code: "custom", message: `Поле «${key}» слишком длинное.` });
      }
    });
  })
  .refine((content) => Object.keys(content).length <= 30, "В блоке слишком много полей.");

const saveInputSchema = pageInputSchema.omit({ slug: true }).extend({
  id: z.string().uuid(),
  slug: z
    .string()
    .trim()
    .max(160)
    .regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/, "Некорректный адрес страницы."),
  routePath: z.string().regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/),
  isSystem: z.boolean(),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().max(160),
  seoDescription: z.string().max(320),
  blocks: z
    .array(
      z.object({
        id: z.string().uuid(),
        blockId: z.string().uuid(),
        content: blockContentSchema,
        isVisible: z.boolean(),
      }),
    )
    .max(50),
});

function friendlyDatabaseError(message: string) {
  if (message.includes("pages_slug_key") || message.includes("pages_route_path_key") || message.includes("duplicate key")) {
    return "Страница с таким адресом уже существует.";
  }
  return "Не удалось сохранить изменения. Проверьте данные и попробуйте ещё раз.";
}

export async function loginAction(
  _previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase ещё не настроен. Добавьте переменные окружения из .env.example." };
  }

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Введите email и пароль." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Неверный email или пароль." };

  if (data.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "У этой учётной записи нет доступа к CMS." };
  }

  return { success: "Вход выполнен." };
}

export async function logoutAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function createPageAction(input: {
  title: string;
  slug: string;
}): Promise<AdminActionResult> {
  const parsed = pageInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("cms_create_page", {
      p_title: parsed.data.title,
      p_slug: parsed.data.slug,
    });
    if (error) return { error: friendlyDatabaseError(error.message) };

    revalidatePath("/admin");
    return { id: String(data), success: "Страница создана." };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function createCaseAction(input: {
  title: string;
  slug: string;
}): Promise<AdminActionResult> {
  const parsed = caseInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data: template, error: templateError } = await supabase
      .from("blocks")
      .select("id,default_content")
      .eq("type", "case_page")
      .eq("is_active", true)
      .maybeSingle();

    if (templateError || !template) {
      return { error: "Шаблон кейса не найден. Повторно выполните миграцию CMS." };
    }

    const caseSlug = `cases/${parsed.data.slug}`;
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .insert({
        title: parsed.data.title,
        slug: caseSlug,
        route_path: `/${caseSlug}`,
        page_kind: "case",
        is_system: false,
        status: "draft",
      })
      .select("id")
      .single();

    if (pageError || !page) return { error: friendlyDatabaseError(pageError?.message || "") };

    const defaultContent = template.default_content && typeof template.default_content === "object"
      ? template.default_content
      : {};
    const { error: blockError } = await supabase.from("page_blocks").insert({
      page_id: page.id,
      block_id: template.id,
      sort_order: 0,
      content: { ...defaultContent, title: parsed.data.title },
      is_visible: true,
    });

    if (blockError) {
      await supabase.from("pages").delete().eq("id", page.id).eq("is_system", false);
      return { error: friendlyDatabaseError(blockError.message) };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    return { id: String(page.id), success: "Кейс создан как черновик." };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function savePageAction(input: unknown): Promise<AdminActionResult> {
  const parsed = saveInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Проверьте поля страницы." };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.rpc("cms_save_page", {
      p_page_id: parsed.data.id,
      p_title: parsed.data.title,
      p_slug: parsed.data.slug,
      p_status: parsed.data.status,
      p_seo_title: parsed.data.seoTitle,
      p_seo_description: parsed.data.seoDescription,
      p_blocks: parsed.data.blocks.map((block, sortOrder) => ({
        id: block.id,
        block_id: block.blockId,
        sort_order: sortOrder,
        content: block.content,
        is_visible: block.isVisible,
      })),
    });
    if (error) return { error: friendlyDatabaseError(error.message) };

    revalidatePath("/admin");
    revalidatePath(`/admin/pages/${parsed.data.id}`);
    revalidatePath(parsed.data.routePath);
    return { success: "Все изменения сохранены." };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function deletePageAction(id: string): Promise<AdminActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "Некорректная страница." };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.rpc("cms_soft_delete_page", { p_page_id: id });
    if (error) return { error: friendlyDatabaseError(error.message) };
    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath("/admin/trash");
    return { success: "Страница перемещена в корзину." };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function restorePageAction(id: string): Promise<AdminActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "Некорректная страница." };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.rpc("cms_restore_page", { p_page_id: id });
    if (error) return { error: friendlyDatabaseError(error.message) };
    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath("/admin/trash");
    return { success: "Страница восстановлена из корзины." };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function permanentDeletePageAction(id: string): Promise<AdminActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "Некорректная страница." };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.rpc("cms_permanent_delete_page", { p_page_id: id });
    if (error) return { error: friendlyDatabaseError(error.message) };
    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath("/admin/trash");
    return { success: "Страница окончательно удалена." };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function getPageRevisionsAction(pageId: string) {
  if (!z.string().uuid().safeParse(pageId).success) return { revisions: [] };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("page_revisions")
      .select("*")
      .eq("page_id", pageId)
      .order("created_at", { ascending: false });

    if (error || !data) return { revisions: [] };
    return { revisions: data };
  } catch {
    return { revisions: [] };
  }
}

export async function getTrashPagesAction() {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (error || !data) return { pages: [] };
    return { pages: data };
  } catch {
    return { pages: [] };
  }
}

export async function togglePageStatusAction(
  id: string,
  nextStatus: "draft" | "published",
): Promise<AdminActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "Некорректная страница." };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("is_system, route_path")
      .eq("id", id)
      .maybeSingle();

    if (pageError || !page) return { error: "Страница не найдена." };

    const { error } = await supabase
      .from("pages")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: friendlyDatabaseError(error.message) };

    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath(`/admin/pages/${id}`);
    if (page.route_path) revalidatePath(page.route_path);

    return {
      success: nextStatus === "published" ? "Страница опубликована." : "Страница снята с публикации.",
    };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function publishAllDraftsAction(): Promise<AdminActionResult & { published?: number }> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // Выбираем все черновики (не системные, не удалённые)
    const { data: drafts, error: fetchError } = await supabase
      .from("pages")
      .select("id, route_path")
      .eq("status", "draft")
      .is("deleted_at", null);

    if (fetchError) return { error: "Не удалось загрузить черновики." };
    if (!drafts || drafts.length === 0) {
      return { success: "Все страницы уже опубликованы.", published: 0 };
    }

    const ids = drafts.map((d: { id: string }) => d.id);

    const { error: updateError } = await supabase
      .from("pages")
      .update({ status: "published", updated_at: new Date().toISOString() })
      .in("id", ids);

    if (updateError) return { error: "Не удалось опубликовать страницы." };

    // Инвалидируем кеш для всех затронутых маршрутов
    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    for (const page of drafts as Array<{ id: string; route_path: string | null }>) {
      revalidatePath(`/admin/pages/${page.id}`);
      if (page.route_path) revalidatePath(page.route_path);
    }

    return {
      success: `Опубликовано ${drafts.length} ${drafts.length === 1 ? "страница" : drafts.length < 5 ? "страницы" : "страниц"}.`,
      published: drafts.length,
    };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function getLeadsAction(input: {
  status?: LeadStatus;
  search?: string;
  page: number;
}) {
  const parsed = leadFiltersSchema.safeParse(input);
  if (!parsed.success) return { error: "Некорректные параметры списка заявок." };

  try {
    await requireAdmin();
    return await getLeads(parsed.data);
  } catch {
    return { error: "Не удалось загрузить заявки. Обновите страницу и попробуйте ещё раз." };
  }
}

export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus,
): Promise<AdminActionResult> {
  if (!z.string().uuid().safeParse(id).success || !leadStatusSchema.safeParse(status).success) {
    return { error: "Некорректная заявка или статус." };
  }

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return { error: "Не удалось изменить статус заявки." };
    if (!data) return { error: "Заявка не найдена." };

    revalidatePath("/admin/crm");
    return { success: "Статус заявки обновлён." };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

export async function deleteLeadAction(id: string): Promise<AdminActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "Некорректная заявка." };

  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return { error: "Не удалось удалить заявку." };
    if (!data) return { error: "Заявка не найдена." };

    revalidatePath("/admin/crm");
    return { success: "Заявка удалена." };
  } catch {
    return { error: "Сессия истекла. Войдите заново." };
  }
}

