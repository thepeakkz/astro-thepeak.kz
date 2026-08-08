import { notFound } from "next/navigation";
import CaseClient, { type CaseData } from "@/app/cases/[slug]/CaseClient";
import { getPublishedPageByPath } from "@/lib/cms/data";
import { getLegacyCaseData } from "@/lib/cms/legacy-cases";
import { parseCaseGallery } from "@/lib/case-gallery";

function contentText(content: Record<string, unknown>, key: string) {
  return typeof content[key] === "string" ? content[key] : "";
}

export default async function ManagedCasePage({ slug }: { slug: string }) {
  const fallback = getLegacyCaseData(slug);
  const cmsPage = await getPublishedPageByPath(`/cases/${slug}`);
  if (!cmsPage) {
    if (!fallback) notFound();
    return <CaseClient data={fallback} slug={slug} />;
  }

  const caseBlock = cmsPage.blocks.find((block) => block.template.type === "case_page");
  if (!caseBlock) {
    if (!fallback) notFound();
    return <CaseClient data={fallback} slug={slug} />;
  }

  const content = caseBlock.content;
  const heroUrl = contentText(content, "heroUrl");
  const heroType = contentText(content, "heroType") === "video" ? "video" : "image";

  // 1. Извлекаем тексты колонок описания (или берем fallback если в CMS не заполнено)
  const descCol1 = contentText(content, "descCol1") || contentText(content, "descriptionLeft");
  const descCol2 = contentText(content, "descCol2") || contentText(content, "descriptionRight");

  let contentBlocks = fallback?.contentBlocks;
  if (descCol1 || descCol2) {
    contentBlocks = [
      ...(descCol1 ? [{ text: descCol1 }] : []),
      ...(descCol2 ? [{ text: descCol2 }] : []),
    ];
  }

  // 2. Извлекаем PDF Брендбук / Презентацию
  const brandbookUrl = contentText(content, "brandbookUrl") || fallback?.brandbookUrl;

  const data: CaseData = {
    ...(fallback || {}),
    title: contentText(content, "title") || fallback?.title || cmsPage.page.title,
    year: contentText(content, "year") || fallback?.year,
    service: contentText(content, "service") || fallback?.service,
    industry: contentText(content, "industry") || fallback?.industry,
    hero_desc: contentText(content, "description") || fallback?.hero_desc,
    contentBlocks,
    brandbookUrl,
    insta_url: contentText(content, "profileUrl") || fallback?.insta_url,
    heroMedia: heroUrl ? { src: heroUrl, type: heroType } : fallback?.heroMedia,
    galleryMedia: parseCaseGallery(content.gallery),
  };

  return <CaseClient data={data} slug={slug} />;
}
