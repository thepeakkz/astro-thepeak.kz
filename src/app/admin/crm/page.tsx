import { redirect } from "next/navigation";
import CrmLeadsClient from "@/components/admin/CrmLeadsClient";
import { getLeads } from "@/lib/leads";
import { getAdminSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminCrmPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const initialData = await getLeads({ page: 1 });

  return <CrmLeadsClient initialData={initialData} />;
}
