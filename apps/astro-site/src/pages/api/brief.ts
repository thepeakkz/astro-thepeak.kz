import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async () => Response.json(
  { error: "Старый генератор кейсов отключён. Используйте новую CMS по адресу /admin." },
  { status: 410 },
);
