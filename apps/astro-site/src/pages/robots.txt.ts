import type { APIRoute } from "astro";

export const GET: APIRoute = () => new Response(
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Sitemap: https://www.thepeak.kz/sitemap.xml",
    "Host: https://www.thepeak.kz",
    "",
  ].join("\n"),
  { headers: { "Content-Type": "text/plain; charset=utf-8" } },
);
