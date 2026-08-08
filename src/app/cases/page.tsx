import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import CasesClient from "./cases-client";
import { parseStringArray } from "@/lib/utils";
import { allCasesData } from "@/data/cases";
import { getPublishedCaseCards, getPublishedPageByPath } from "@/lib/cms/data";
import { absoluteUrl, createSeoMetadata, getBreadcrumbJsonLd, pageSeo } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata(pageSeo.cases);
export const dynamic = "force-dynamic";

export default async function CasesCatalogPage() {
  const [cmsPage, cmsCaseCards] = await Promise.all([
    getPublishedPageByPath("/cases"),
    getPublishedCaseCards(),
  ]);
  const cmsCasesByPath = new Map(cmsCaseCards.map((caseItem) => [caseItem.href, caseItem]));
  const existingPaths = new Set(allCasesData.map((caseItem) => caseItem.href));
  const rawCases = [
    ...cmsCaseCards.filter((caseItem) => !existingPaths.has(caseItem.href)),
    ...allCasesData.map((caseItem) => {
      const cmsCase = cmsCasesByPath.get(caseItem.href);
      return cmsCase ? { ...caseItem, ...cmsCase, size: caseItem.size } : caseItem;
    }),
  ];

  const casesGridBlock = cmsPage?.blocks.find((block) => block.template.type === "cases_grid");
  const caseOrder = parseStringArray(casesGridBlock?.content.caseOrder);
  const hiddenHrefs = parseStringArray(casesGridBlock?.content.hiddenHrefs) || [];
  const hiddenSet = new Set(hiddenHrefs);

  const visibleCases = rawCases.filter((item) => !hiddenSet.has(item.href));

  const cases = (() => {
    if (!caseOrder || caseOrder.length === 0) return visibleCases;
    const casesByHref = new Map(visibleCases.map((item) => [item.href, item]));
    const ordered = caseOrder.flatMap((href) => {
      const item = casesByHref.get(href);
      return item ? [item] : [];
    });
    const orderedSet = new Set(ordered.map((item) => item.href));
    const missing = visibleCases.filter((item) => !orderedSet.has(item.href));
    return [...ordered, ...missing];
  })();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/cases#collection"),
    name: "Кейсы ThePeak",
    description: pageSeo.cases.description,
    url: absoluteUrl("/cases"),
    inLanguage: "ru-KZ",
    about: ["SMM", "digital-маркетинг", "брендинг", "продакшн", "Казахстан", "Алматы", "Астана"],
    mainEntity: {
      "@type": "ItemList",
      itemListElement: cases.map((caseItem, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: caseItem.name,
        url: absoluteUrl(caseItem.href),
      })),
    },
  };

  return (
    <>
      <JsonLd
        data={[
          getBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Кейсы", path: "/cases" },
          ]),
          collectionJsonLd,
        ]}
      />
      <CasesClient blocks={cmsPage?.blocks} cases={cases} />
    </>
  );
}
