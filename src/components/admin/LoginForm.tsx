"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { loginAction, type AdminActionResult } from "@/app/admin/actions";
import { formatTypography } from "@/utils/typography";

const initialState: AdminActionResult = {};

export default function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.replace("/admin");
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-4">
      {!configured && (
        <div className="p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
          {formatTypography("Авторизация временно недоступна. Обратитесь к администратору.")}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="email-input">
          Электронная почта
        </label>
        <input
          id="email-input"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={!configured}
          className="peak-admin__input !h-10 !text-xs"
          placeholder="admin@thepeak.kz"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="password-input">
          Пароль
        </label>
        <input
          id="password-input"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!configured}
          className="peak-admin__input !h-10 !text-xs"
          placeholder="••••••••••••"
        />
      </div>

      {state.error && (
        <div role="alert" className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {formatTypography(state.error)}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || !configured}
        className="peak-admin__button peak-admin__button--primary w-full !h-10 !text-xs font-medium"
      >
        {pending ? (
          <>
            <LockKeyhole className="size-3.5 animate-pulse" aria-hidden="true" />
            <span>Проверка данных…</span>
          </>
        ) : (
          <span>Войти</span>
        )}
      </button>
    </form>
  );
}
