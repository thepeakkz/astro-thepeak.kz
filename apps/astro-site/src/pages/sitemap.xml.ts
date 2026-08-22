import type { APIRoute } from "astro";
import { allCasesData } from "@/data/cases";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedPagesForSitemap } from "@astro/server/public-data";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character]!);
}

export const GET: APIRoute = async () => {
  const now = new Date().toISOString();
  const cmsPages = await getPublishedPagesForSitemap();
  const routes = [
    { url: absoluteUrl("/"), lastmod: now, changefreq: "weekly", priority: "1.0" },
    { url: absoluteUrl("/cases"), lastmod: now, changefreq: "weekly", priority: "0.9" },
    { url: absoluteUrl("/privacy"), lastmod: now, changefreq: "yearly", priority: "0.2" },
    ...allCasesData.map((item) => ({ url: absoluteUrl(item.href), lastmod: now, changefreq: "monthly", priority: "0.75" })),
    ...cmsPages.map((page) => ({ url: absoluteUrl(page.route_path), lastmod: new Date(page.updated_at).toISOString(), changefreq: "monthly", priority: "0.7" })),
  ];
  const uniqueRoutes = [...new Map(routes.map((route) => [route.url, route])).values()];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueRoutes.map((route) => `  <url><loc>${escapeXml(route.url)}</loc><lastmod>${route.lastmod}</lastmod><changefreq>${route.changefreq}</changefreq><priority>${route.priority}</priority></url>`).join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } });
};
