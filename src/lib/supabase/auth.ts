import "server-only";

import { cache } from "react";
import { createClient } from "./server";
import { hasSupabaseEnv } from "./env";

type AppMetadata = { role?: unknown };

export const getAdminSession = cache(async () => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return null;
  }

  const appMetadata = data.claims.app_metadata as AppMetadata | undefined;
  if (appMetadata?.role !== "admin") {
    return null;
  }

  return {
    email: typeof data.claims.email === "string" ? data.claims.email : "Администратор",
    subject: data.claims.sub,
  };
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

