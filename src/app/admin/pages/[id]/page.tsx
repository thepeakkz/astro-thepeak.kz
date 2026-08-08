import { notFound, redirect } from "next/navigation";
import PageEditor from "@/components/admin/PageEditor";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAdminPage, getAllCasesList } from "@/lib/cms/data";

export const dynamic = "force-dynamic";

export default async function AdminEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const [data, availableCases] = await Promise.all([
    getAdminPage(id),
    getAllCasesList(),
  ]);
  if (!data) notFound();

  return (
    <>
      <PageEditor
        initialPage={data.page}
        initialBlocks={data.blocks}
        templates={data.templates}
        availableCases={availableCases}
      />
    </>
  );
}
