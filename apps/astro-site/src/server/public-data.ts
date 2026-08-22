import { allCasesData, type CaseItem } from "@/data/cases";
import { targetCases } from "@/data/target-cases";
import { parseCaseGallery } from "@/lib/case-gallery";
import {
  getAllCasesList,
  getPublishedCaseCards,
  getPublishedPageByPath,
  getPublishedPageBySlug,
  getPublishedPagesForSitemap,
} from "@/lib/cms/data";
import { getLegacyCaseData } from "@/lib/cms/legacy-cases";
import { parseStringArray } from "@/lib/utils";
import type { CaseData } from "@/app/cases/[slug]/CaseClient";

function contentText(content: Record<string, unknown>, key: string) {
  return typeof content[key] === "string" ? content[key] : "";
}

export async function loadHomePage() {
  const [cmsPage, allCases] = await Promise.all([
    getPublishedPageByPath("/"),
    getAllCasesList(),
  ]);
  return { allCases, cmsPage };
}

export async function loadCasesCatalog() {
  const [cmsPage, cmsCaseCards] = await Promise.all([
    getPublishedPageByPath("/cases"),
    getPublishedCaseCards(),
  ]);
  const cmsCasesByPath = new Map(cmsCaseCards.map((caseItem) => [caseItem.href, caseItem]));
  const existingPaths = new Set(allCasesData.map((caseItem) => caseItem.href));
  const rawCases: CaseItem[] = [
    ...cmsCaseCards.filter((caseItem) => !existingPaths.has(caseItem.href)),
    ...allCasesData.map((caseItem) => {
      const cmsCase = cmsCasesByPath.get(caseItem.href);
      return cmsCase ? { ...caseItem, ...cmsCase, size: caseItem.size } : caseItem;
    }),
  ];
  const casesGridBlock = cmsPage?.blocks.find((block) => block.template.type === "cases_grid");
  const caseOrder = parseStringArray(casesGridBlock?.content.caseOrder);
  const hiddenSet = new Set(parseStringArray(casesGridBlock?.content.hiddenHrefs) || []);
  const visibleCases = rawCases.filter((item) => !hiddenSet.has(item.href));

  if (!caseOrder?.length) return { blocks: cmsPage?.blocks, cases: visibleCases };
  const casesByHref = new Map(visibleCases.map((item) => [item.href, item]));
  const ordered = caseOrder.flatMap((href) => {
    const item = casesByHref.get(href);
    return item ? [item] : [];
  });
  const orderedSet = new Set(ordered.map((item) => item.href));
  return {
    blocks: cmsPage?.blocks,
    cases: [...ordered, ...visibleCases.filter((item) => !orderedSet.has(item.href))],
  };
}

export async function loadCase(slug: string): Promise<CaseData | null> {
  const fallback = getLegacyCaseData(slug);
  const cmsPage = await getPublishedPageByPath(`/cases/${slug}`);
  if (!cmsPage) return fallback;

  const caseBlock = cmsPage.blocks.find((block) => block.template.type === "case_page");
  if (!caseBlock) return fallback;

  const content = caseBlock.content;
  const heroUrl = contentText(content, "heroUrl");
  const descCol1 = contentText(content, "descCol1") || contentText(content, "descriptionLeft");
  const descCol2 = contentText(content, "descCol2") || contentText(content, "descriptionRight");
  const contentBlocks = descCol1 || descCol2
    ? [...(descCol1 ? [{ text: descCol1 }] : []), ...(descCol2 ? [{ text: descCol2 }] : [])]
    : fallback?.contentBlocks;

  return {
    ...(fallback || {}),
    title: contentText(content, "title") || fallback?.title || cmsPage.page.title,
    year: contentText(content, "year") || fallback?.year,
    service: contentText(content, "service") || fallback?.service,
    industry: contentText(content, "industry") || fallback?.industry,
    hero_desc: contentText(content, "description") || fallback?.hero_desc,
    contentBlocks,
    brandbookUrl: contentText(content, "brandbookUrl") || fallback?.brandbookUrl,
    insta_url: contentText(content, "profileUrl") || fallback?.insta_url,
    heroMedia: heroUrl
      ? { src: heroUrl, type: contentText(content, "heroType") === "video" ? "video" : "image" }
      : fallback?.heroMedia,
    galleryMedia: parseCaseGallery(content.gallery),
  };
}

export async function isNativePageVisible(routePath: string) {
  const cmsPage = await getPublishedPageByPath(routePath);
  return !cmsPage || cmsPage.blocks.some((block) => block.template.type === "native_page");
}

export { getPublishedPageByPath, getPublishedPageBySlug, getPublishedPagesForSitemap, targetCases };
