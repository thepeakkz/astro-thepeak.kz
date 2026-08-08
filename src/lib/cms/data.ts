import "server-only";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/supabase/auth";
import { allCasesData, type CaseItem } from "@/data/cases";
import { getLegacyCaseData } from "@/lib/cms/legacy-cases";
import type { CmsBlockTemplate, CmsEditorBlock, CmsPage, CmsPageBlock } from "@/types/cms";

function objectContent(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeTemplate(value: Record<string, unknown>): CmsBlockTemplate {
  const fields = Array.isArray(value.fields) ? ([...(value.fields as CmsBlockTemplate["fields"])] as CmsBlockTemplate["fields"]) : [];
  const type = String(value.type);

  if (type === "case_page") {
    const existingFieldNames = new Set(fields.map((f) => f.name));
    const extraFields: CmsBlockTemplate["fields"] = [];

    if (!existingFieldNames.has("descCol1")) {
      extraFields.push({
        name: "descCol1",
        label: "Подробное описание (Левая колонка / Задача)",
        type: "textarea",
      });
    }
    if (!existingFieldNames.has("descCol2")) {
      extraFields.push({
        name: "descCol2",
        label: "Подробное описание (Правая колонка / Результат)",
        type: "textarea",
      });
    }
    if (!existingFieldNames.has("brandbookUrl")) {
      extraFields.push({
        name: "brandbookUrl",
        label: "Презентация / Брендбук в формате PDF",
        type: "media",
        accept: "application/pdf,.pdf",
      });
    }

    if (extraFields.length > 0) {
      fields.push(...extraFields);
    }
  }

  return {
    id: String(value.id),
    type,
    name: String(value.name),
    description: typeof value.description === "string" ? value.description : "",
    fields,
    default_content: objectContent(value.default_content),
    is_active: value.is_active !== false,
    page_kinds: Array.isArray(value.page_kinds) ? value.page_kinds.map(String) : ["builder"],
  };
}

const pageSelect =
  "id,slug,route_path,title,seo_title,seo_description,status,page_kind,is_system,created_at,updated_at,published_at";

const templateSelect = "id,type,name,description,fields,default_content,is_active,page_kinds";

function normalizePageBlock(value: Record<string, unknown>): CmsPageBlock {
  return {
    id: String(value.id),
    page_id: String(value.page_id),
    block_id: String(value.block_id),
    sort_order: Number(value.sort_order),
    content: objectContent(value.content),
    is_visible: value.is_visible !== false,
  };
}

export async function getAdminPages(): Promise<CmsPage[]> {
  await requireAdmin();
  const supabase = await createClient();
  let { data, error } = await supabase
    .from("pages")
    .select(pageSelect)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error && error.message.includes("deleted_at")) {
    const fallback = await supabase
      .from("pages")
      .select(pageSelect)
      .order("updated_at", { ascending: false });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw new Error(error.message);
  return (data || []) as CmsPage[];
}

export async function getAdminPage(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  let pageRes = await supabase
    .from("pages")
    .select(pageSelect)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (pageRes.error && pageRes.error.message.includes("deleted_at")) {
    pageRes = await supabase
      .from("pages")
      .select(pageSelect)
      .eq("id", id)
      .maybeSingle();
  }

  const [{ data: templates, error: templatesError }, { data: pageBlocks, error: blocksError }] =
    await Promise.all([
      supabase
        .from("blocks")
        .select(templateSelect)
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("page_blocks")
        .select("id,page_id,block_id,sort_order,content,is_visible")
        .eq("page_id", id)
        .order("sort_order", { ascending: true }),
    ]);

  if (pageRes.error || templatesError || blocksError) {
    throw new Error(pageRes.error?.message || templatesError?.message || blocksError?.message);
  }
  const page = pageRes.data;
  if (!page) return null;

  const normalizedTemplates = (templates || [])
    .map((item) => normalizeTemplate(item))
    .filter((template) => template.page_kinds.includes(String(page.page_kind || "builder")));
  const byId = new Map(normalizedTemplates.map((template) => [template.id, template]));
  const editorBlocks = (pageBlocks || []).flatMap((item) => {
    const block = normalizePageBlock(item);
    const template = byId.get(block.block_id);
    if (!template) return [];

    if (template.type === "case_page") {
      const slug = String(page.slug || "").replace(/^cases\//, "");
      const legacy = getLegacyCaseData(slug);
      if (legacy) {
        const content = { ...block.content };

        if (!content.title && legacy.title) content.title = legacy.title;
        if (!content.year && legacy.year) content.year = legacy.year;
        if (!content.service && legacy.service) content.service = legacy.service;
        if (!content.industry && legacy.industry) content.industry = legacy.industry;
        if (!content.description && legacy.hero_desc) content.description = legacy.hero_desc;
        if (!content.profileUrl && legacy.insta_url) content.profileUrl = legacy.insta_url;
        if (!content.brandbookUrl && legacy.brandbookUrl) content.brandbookUrl = legacy.brandbookUrl;
        if (!content.showreelUrl && legacy.showreelUrl) content.showreelUrl = legacy.showreelUrl;

        if (!content.descCol1 && legacy.contentBlocks && legacy.contentBlocks.length > 0) {
          if (legacy.contentBlocks.length >= 3) {
            content.descCol1 = legacy.contentBlocks.slice(0, -1).map((b) => b.text).join("\n\n");
          } else {
            content.descCol1 = legacy.contentBlocks[0]?.text || "";
          }
        }

        if (!content.descCol2 && legacy.contentBlocks && legacy.contentBlocks.length > 1) {
          if (legacy.contentBlocks.length >= 3) {
            content.descCol2 = legacy.contentBlocks[legacy.contentBlocks.length - 1]?.text || "";
          } else {
            content.descCol2 = legacy.contentBlocks[1]?.text || "";
          }
        }

        return [{ ...block, content, template }];
      }
    }

    return [{ ...block, template }];
  }) satisfies CmsEditorBlock[];

  return {
    page: page as CmsPage,
    templates: normalizedTemplates,
    blocks: editorBlocks,
  };
}

export async function getPublishedPageBySlug(slug: string) {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select(pageSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (pageError || !page) return null;

  const { data: pageBlocks, error: blocksError } = await supabase
    .from("page_blocks")
    .select("id,page_id,block_id,sort_order,content,is_visible")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (blocksError) return null;

  const templateIds = [...new Set((pageBlocks || []).map((item) => String(item.block_id)))];
  const { data: templates, error: templatesError } = templateIds.length
    ? await supabase
        .from("blocks")
        .select(templateSelect)
        .in("id", templateIds)
        .eq("is_active", true)
    : { data: [], error: null };
  if (templatesError) return null;

  const byId = new Map(
    (templates || []).map((item) => {
      const template = normalizeTemplate(item);
      return [template.id, template] as const;
    }),
  );
  const blocks = (pageBlocks || []).flatMap((item) => {
    const block = normalizePageBlock(item);
    const template = byId.get(block.block_id);
    return template ? [{ ...block, template }] : [];
  }) satisfies CmsEditorBlock[];

  return { page: page as CmsPage, blocks };
}

export async function getPublishedPageByPath(routePath: string) {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select(pageSelect)
    .eq("route_path", routePath)
    .eq("status", "published")
    .maybeSingle();

  if (pageError || !page) return null;

  const { data: pageBlocks, error: blocksError } = await supabase
    .from("page_blocks")
    .select("id,page_id,block_id,sort_order,content,is_visible")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (blocksError) return null;

  const templateIds = [...new Set((pageBlocks || []).map((item) => String(item.block_id)))];
  const { data: templates, error: templatesError } = templateIds.length
    ? await supabase
        .from("blocks")
        .select(templateSelect)
        .in("id", templateIds)
        .eq("is_active", true)
    : { data: [], error: null };
  if (templatesError) return null;

  const byId = new Map(
    (templates || []).map((item) => {
      const template = normalizeTemplate(item);
      return [template.id, template] as const;
    }),
  );
  const blocks = (pageBlocks || []).flatMap((item) => {
    const block = normalizePageBlock(item);
    const template = byId.get(block.block_id);
    return template ? [{ ...block, template }] : [];
  }) satisfies CmsEditorBlock[];

  return { page: page as CmsPage, blocks };
}

export async function getPublishedCaseCards(): Promise<CaseItem[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const [{ data: pages, error: pagesError }, { data: template, error: templateError }] = await Promise.all([
    supabase
      .from("pages")
      .select("id,route_path,title,updated_at")
      .eq("status", "published")
      .eq("page_kind", "case")
      .order("updated_at", { ascending: false }),
    supabase
      .from("blocks")
      .select("id")
      .eq("type", "case_page")
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  if (pagesError || templateError || !template || !pages?.length) return [];

  const { data: pageBlocks, error: blocksError } = await supabase
    .from("page_blocks")
    .select("page_id,content")
    .eq("block_id", template.id)
    .eq("is_visible", true)
    .in("page_id", pages.map((page) => page.id));
  if (blocksError) return [];

  const contentByPage = new Map(
    (pageBlocks || []).map((block) => [String(block.page_id), objectContent(block.content)]),
  );

  return pages.flatMap((page) => {
    const content = contentByPage.get(String(page.id));
    if (!content) return [];

    const text = (key: string) => typeof content[key] === "string" ? content[key].trim() : "";
    const service = text("service") || "Кейс";
    const heroUrl = text("heroUrl");
    const isVideo = text("heroType") === "video";

    return [{
      name: text("title") || String(page.title),
      type: service,
      text: text("description"),
      image: !isVideo && heroUrl ? heroUrl : undefined,
      video: isVideo && heroUrl ? heroUrl : undefined,
      size: "small" as const,
      href: String(page.route_path),
      services: service.split(/[,/]/).map((item) => item.trim()).filter(Boolean),
      industry: text("industry"),
    }];
  });
}

export async function getAllCasesList(): Promise<CaseItem[]> {
  const cmsCaseCards = await getPublishedCaseCards();
  const cmsCasesByPath = new Map(cmsCaseCards.map((caseItem) => [caseItem.href, caseItem]));
  const existingPaths = new Set(allCasesData.map((caseItem) => caseItem.href));

  const pageIdByRoute = new Map<string, string>();
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const { data: pages } = await supabase
        .from("pages")
        .select("id,route_path")
        .eq("page_kind", "case");
      (pages || []).forEach((p) => {
        if (p.route_path && p.id) {
          pageIdByRoute.set(String(p.route_path), String(p.id));
        }
      });
    } catch {
      // Ignore DB errors when fetching page IDs
    }
  }

  const combined = [
    ...cmsCaseCards.filter((caseItem) => !existingPaths.has(caseItem.href)),
    ...allCasesData.map((caseItem) => {
      const cmsCase = cmsCasesByPath.get(caseItem.href);
      return cmsCase ? { ...caseItem, ...cmsCase, size: caseItem.size } : caseItem;
    }),
  ];

  return combined.map((caseItem) => {
    const pageId = pageIdByRoute.get(caseItem.href);
    return {
      ...caseItem,
      pageId,
      adminEditUrl: pageId ? `/admin/pages/${pageId}` : undefined,
    };
  });
}

export async function getPublishedPagesForSitemap() {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("route_path,updated_at")
    .eq("status", "published")
    .eq("is_system", false)
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data || []) as Array<{ route_path: string; updated_at: string }>;
}
