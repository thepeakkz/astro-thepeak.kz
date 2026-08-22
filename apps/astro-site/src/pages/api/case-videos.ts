import type { APIRoute } from "astro";
import { GET as legacyGet } from "@/app/api/case-videos/route";
import { NextRequest } from "@astro/compat/server";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => legacyGet(
  new NextRequest(request) as unknown as Parameters<typeof legacyGet>[0],
);
