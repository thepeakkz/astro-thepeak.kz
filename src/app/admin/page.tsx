import { redirect } from "next/navigation";
import DashboardClient from "@/components/admin/DashboardClient";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAdminPages } from "@/lib/cms/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const pages = await getAdminPages();

  return (
    <>
      <DashboardClient initialPages={pages} />
    </>
  );
}
