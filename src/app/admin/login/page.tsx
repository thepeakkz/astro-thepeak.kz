import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/supabase/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const configured = hasSupabaseEnv();
  if (configured && (await getAdminSession())) redirect("/admin");

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc] text-slate-900 relative overflow-hidden">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1 mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <span className="font-bold tracking-tight text-base text-slate-900">THE PEAK</span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              CMS
            </span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Вход в панель управления
          </h1>
          <p className="text-xs text-slate-500">
            Введите почту и пароль для доступа к редактированию
          </p>
        </div>

        <LoginForm configured={configured} />
      </div>
    </main>
  );
}
