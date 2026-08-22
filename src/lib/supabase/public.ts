import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

// Stateless client for public, read-only queries (published pages/cases).
// Unlike lib/supabase/server.ts it never touches `cookies()`, so routes
// that only read through it stay eligible for static rendering / ISR
// instead of being forced into per-request dynamic rendering.
export function createPublicClient() {
  const { key, url } = getSupabaseEnv();
  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}
