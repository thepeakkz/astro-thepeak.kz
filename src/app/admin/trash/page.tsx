import { redirect } from "next/navigation";
import TrashDashboardClient from "@/components/admin/TrashDashboardClient";
import { getAdminSession } from "@/lib/supabase/auth";
import { getTrashPagesAction } from "@/app/admin/actions";
import type { CmsTrashPage } from "@/types/cms";

export const dynamic = "force-dynamic";

export default async function AdminTrashPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const res = await getTrashPagesAction();
  const pages = (res.pages || []) as CmsTrashPage[];

  return (
    <>
      <TrashDashboardClient initialPages={pages} />
    </>
  );
}
