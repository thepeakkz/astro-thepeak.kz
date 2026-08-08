"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { loginAction, type AdminActionResult } from "@/app/admin/actions";

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
    <form action={formAction} className="mt-8 space-y-5">
      {!configured && (
        <div className="peak-admin__notice peak-admin__notice--warning !mt-0">
          Подключение к Supabase ещё не настроено. Добавьте переменные из файла
          <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5">.env.example</code>.
        </div>
      )}
      <label className="peak-admin__field">
        <span className="peak-admin__label">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={!configured}
          className="peak-admin__input"
          placeholder="admin@thepeak.kz"
        />
      </label>
      <label className="peak-admin__field">
        <span className="peak-admin__label">Пароль</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!configured}
          className="peak-admin__input"
          placeholder="Введите пароль"
        />
      </label>
      {state.error && (
        <p role="alert" className="peak-admin__notice peak-admin__notice--error !mt-0">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !configured}
        className="peak-admin__button peak-admin__button--primary w-full"
      >
        {pending ? (
          <>
            <LockKeyhole className="size-5 animate-pulse" aria-hidden="true" />
            Входим…
          </>
        ) : (
          <>
            Войти в CMS
            <ArrowRight className="size-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
