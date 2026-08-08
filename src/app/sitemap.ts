import type { MetadataRoute } from "next";
import { allCasesData } from "@/data/cases";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedPagesForSitemap } from "@/lib/cms/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/cases"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const caseRoutes: MetadataRoute.Sitemap = allCasesData.map((caseItem) => ({
    url: absoluteUrl(caseItem.href),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const cmsPages = await getPublishedPagesForSitemap();
  const cmsRoutes: MetadataRoute.Sitemap = cmsPages.map((page) => ({
    url: absoluteUrl(page.route_path),
    lastModified: new Date(page.updated_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...caseRoutes, ...cmsRoutes];
}
