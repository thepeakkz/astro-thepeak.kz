"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ExternalLink, FileText, FolderOpen, LogOut, Trash2 } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

export default function AdminHeader() {
  const pathname = usePathname();

  // На странице логина топбар не нужен
  if (pathname?.startsWith("/admin/login")) return null;

  const isAnalytics = pathname?.startsWith("/admin/analytics");
  const isCases = pathname?.startsWith("/admin/cases");
  const isTrash = pathname?.startsWith("/admin/trash");
  const isPages = (pathname === "/admin" || pathname?.startsWith("/admin/pages")) && !isTrash;

  return (
    <header className="peak-admin__topbar" role="banner">
      {/* Логотип */}
      <Link href="/admin" className="peak-admin__topbar-logo" aria-label="CMS главная">
        THE<span className="peak-admin__topbar-logo-peak">PEAK</span>&nbsp;CMS
      </Link>

      {/* Навигация */}
      <nav className="peak-admin__topbar-nav" aria-label="CMS навигация">
        <Link
          href="/admin"
          className={`peak-admin__topbar-link ${isPages ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isPages ? "page" : undefined}
        >
          <FileText className="size-3.5" aria-hidden="true" />
          Страницы
        </Link>

        <Link
          href="/admin/cases"
          className={`peak-admin__topbar-link ${isCases ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isCases ? "page" : undefined}
        >
          <FolderOpen className="size-3.5" aria-hidden="true" />
          Кейсы
        </Link>

        <Link
          href="/admin/trash"
          className={`peak-admin__topbar-link ${isTrash ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isTrash ? "page" : undefined}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Корзина
        </Link>

        <Link
          href="/admin/analytics"
          className={`peak-admin__topbar-link ${isAnalytics ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isAnalytics ? "page" : undefined}
        >
          <BarChart3 className="size-3.5" aria-hidden="true" />
          Аналитика
        </Link>
      </nav>

      {/* Действия справа */}
      <div className="peak-admin__topbar-actions">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="peak-admin__topbar-link"
          title="Открыть сайт"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Сайт</span>
        </a>

        <form action={logoutAction}>
          <button type="submit" className="peak-admin__topbar-exit">
            <LogOut className="size-3" aria-hidden="true" />
            Выйти
          </button>
        </form>
      </div>
    </header>
  );
}
