import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/supabase/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const configured = hasSupabaseEnv();
  if (configured && (await getAdminSession())) redirect("/admin");

  return (
    <main className="peak-admin__login">
      <div className="peak-admin__login-card">
        <span className="peak-admin__login-mark">
          <ShieldCheck className="size-7" aria-hidden="true" />
        </span>
        <h1 className="peak-admin__login-title">Вход в CMS</h1>
        <p className="peak-admin__login-copy">
          Только для администраторов сайта thepeak.kz.
        </p>
        <LoginForm configured={configured} />
      </div>
    </main>
  );
}
