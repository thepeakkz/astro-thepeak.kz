import { NextRequest, NextResponse } from "next/server";
import { getLeads, isLeadStatus } from "@/lib/leads";
import { getAdminSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const statusValue = request.nextUrl.searchParams.get("status");
  const search = request.nextUrl.searchParams.get("q") || undefined;
  const pageValue = Number(request.nextUrl.searchParams.get("page") || "1");

  if (statusValue && !isLeadStatus(statusValue)) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }
  if (!Number.isInteger(pageValue) || pageValue < 1) {
    return NextResponse.json({ error: "Некорректная страница" }, { status: 400 });
  }

  const status = isLeadStatus(statusValue) ? statusValue : undefined;

  try {
    const result = await getLeads({
      status,
      search,
      page: pageValue,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Не удалось загрузить заявки" }, { status: 500 });
  }
}
