import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Navigation from "@/components/Navigation";
import CmsBlockRenderer from "@/components/cms/CmsBlockRenderer";
import HomeClient from "./home-client";
import { getAllCasesList, getPublishedPageByPath } from "@/lib/cms/data";
import { createSeoMetadata, getBreadcrumbJsonLd, getServiceJsonLd, pageSeo } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata(pageSeo.home);
export const dynamic = "force-dynamic";

export default async function Home() {
  const [cmsPage, allCases] = await Promise.all([
    getPublishedPageByPath("/"),
    getAllCasesList(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          getBreadcrumbJsonLd([{ name: "Главная", path: "/" }]),
          getServiceJsonLd({
            name: "Маркетинговое агентство в\u00a0Казахстане",
            description:
              "Комплексный маркетинг, SMM, digital-стратегия, брендинг, разработка сайтов и\u00a0продакшн для бизнеса в\u00a0Казахстане, Алматы и\u00a0Астане.",
            path: "/",
            serviceType: "Маркетинг полного цикла",
          }),
        ]}
      />
      {cmsPage ? (
        <>
          <Navigation />
          <CmsBlockRenderer blocks={cmsPage.blocks} caseItems={allCases} />
        </>
      ) : (
        <HomeClient />
      )}
    </>
  );
}
