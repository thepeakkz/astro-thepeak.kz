import type { APIRoute } from "astro";

export const ALL: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const adminOrigin = process.env.ADMIN_ORIGIN || "http://localhost:3000";
  return redirect(`${adminOrigin}${url.pathname}${url.search}`, 307);
};
