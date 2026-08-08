import { redirect } from "next/navigation";
import CasesDashboardClient from "@/components/admin/CasesDashboardClient";
import { getAdminPages } from "@/lib/cms/data";
import { getAdminSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminCasesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const pages = await getAdminPages();
  const cases = pages.filter((page) => page.page_kind === "case");

  return (
    <>
      <CasesDashboardClient initialPages={cases} />
    </>
  );
}
