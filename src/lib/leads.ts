import "server-only";

import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUSES, type Lead, type LeadListResult, type LeadStatus } from "@/types/leads";

export const LEADS_PAGE_SIZE = 30;

export type LeadFilters = {
  status?: LeadStatus;
  search?: string;
  page?: number;
};

export function isLeadStatus(value: string | null | undefined): value is LeadStatus {
  return typeof value === "string" && LEAD_STATUSES.includes(value as LeadStatus);
}

function normalizeSearch(value: string | undefined) {
  return (value || "")
    .trim()
    .slice(0, 100)
    .replace(/[\\,%().]/g, " ")
    .replace(/\s+/g, " ");
}

export async function getLeads(filters: LeadFilters = {}): Promise<LeadListResult> {
  const supabase = await createClient();
  const page = Math.max(1, Math.floor(filters.page || 1));
  const search = normalizeSearch(filters.search);
  const from = (page - 1) * LEADS_PAGE_SIZE;
  const to = from + LEADS_PAGE_SIZE - 1;

  let listQuery = supabase
    .from("leads")
    .select("id,name,phone,source,comment,contact_method,status,attribution,created_at,updated_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) listQuery = listQuery.eq("status", filters.status);
  if (search) listQuery = listQuery.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);

  const [listResult, totalResult, newResult] = await Promise.all([
    listQuery,
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  if (listResult.error || totalResult.error || newResult.error) {
    throw new Error("Не удалось загрузить заявки.");
  }

  const filteredTotal = listResult.count || 0;

  return {
    leads: (listResult.data || []) as Lead[],
    filteredTotal,
    total: totalResult.count || 0,
    newCount: newResult.count || 0,
    page,
    pageSize: LEADS_PAGE_SIZE,
    hasMore: to + 1 < filteredTotal,
  };
}
