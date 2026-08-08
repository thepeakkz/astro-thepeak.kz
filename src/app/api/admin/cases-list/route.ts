import { getAllCasesList } from "@/lib/cms/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cases = await getAllCasesList();
    return Response.json({ cases });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch cases" },
      { status: 500 },
    );
  }
}
