import { redirect } from "next/navigation";
import AnalyticsDashboardClient from "@/components/admin/AnalyticsDashboardClient";
import { getAdminSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <AnalyticsDashboardClient />
    </>
  );
}
