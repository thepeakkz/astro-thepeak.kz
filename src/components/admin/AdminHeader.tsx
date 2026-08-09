"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BarChart3, Command, ExternalLink, FileText, FolderOpen, Inbox, LogOut, Search, Trash2, X } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { formatTypography } from "@/utils/typography";

const commandItems = [
  { href: "/admin", label: "Страницы", description: "Основные страницы сайта", icon: FileText },
  { href: "/admin/cases", label: "Кейсы", description: "Проекты и портфолио", icon: FolderOpen },
  { href: "/admin/crm", label: "Заявки", description: "Новые обращения с сайта", icon: Inbox },
  { href: "/admin/analytics", label: "Аналитика", description: "Трафик, воронки и лимиты", icon: BarChart3 },
  { href: "/admin/trash", label: "Корзина", description: "Удалённые страницы", icon: Trash2 },
] as const;

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    if (!normalized) return commandItems;
    return commandItems.filter((item) => `${item.label} ${item.description}`.toLocaleLowerCase("ru").includes(normalized));
  }, [query]);

  // На странице логина топбар не нужен
  if (pathname?.startsWith("/admin/login")) return null;

  const isAnalytics = pathname?.startsWith("/admin/analytics");
  const isCases = pathname?.startsWith("/admin/cases");
  const isCrm = pathname?.startsWith("/admin/crm");
  const isTrash = pathname?.startsWith("/admin/trash");
  const isPages = (pathname === "/admin" || pathname?.startsWith("/admin/pages")) && !isTrash;

  return (
    <header className="peak-admin__topbar" role="banner">
      {/* Навигация */}
      <nav className="peak-admin__topbar-nav" aria-label="CMS навигация">
        <Link
          href="/admin"
          className={`peak-admin__topbar-link ${isPages ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isPages ? "page" : undefined}
        >
          <FileText className="size-3.5" aria-hidden="true" />
          <span className="peak-admin__topbar-label">Страницы</span>
        </Link>

        <Link
          href="/admin/cases"
          className={`peak-admin__topbar-link ${isCases ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isCases ? "page" : undefined}
        >
          <FolderOpen className="size-3.5" aria-hidden="true" />
          <span className="peak-admin__topbar-label">Кейсы</span>
        </Link>

        <Link
          href="/admin/crm"
          className={`peak-admin__topbar-link ${isCrm ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isCrm ? "page" : undefined}
        >
          <Inbox className="size-3.5" aria-hidden="true" />
          <span className="peak-admin__topbar-label">Заявки</span>
        </Link>

        <Link
          href="/admin/trash"
          className={`peak-admin__topbar-link ${isTrash ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isTrash ? "page" : undefined}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          <span className="peak-admin__topbar-label">Корзина</span>
        </Link>

        <Link
          href="/admin/analytics"
          className={`peak-admin__topbar-link ${isAnalytics ? "peak-admin__topbar-link--active" : ""}`}
          aria-current={isAnalytics ? "page" : undefined}
        >
          <BarChart3 className="size-3.5" aria-hidden="true" />
          <span className="peak-admin__topbar-label">Аналитика</span>
        </Link>
      </nav>

      {/* Действия справа */}
      <div className="peak-admin__topbar-actions">
        <button
          type="button"
          className="peak-admin__command-trigger"
          onClick={() => setPaletteOpen(true)}
          aria-label="Открыть быстрый переход"
        >
          <Search className="size-3.5" aria-hidden="true" />
          <span className="peak-admin__topbar-label">Перейти</span>
          <kbd>⌘K</kbd>
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="peak-admin__topbar-link"
          title="Открыть сайт"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="peak-admin__topbar-label">Сайт</span>
        </a>

        <form action={logoutAction}>
          <button type="submit" className="peak-admin__topbar-exit">
            <LogOut className="size-3" aria-hidden="true" />
            <span className="peak-admin__topbar-label">Выйти</span>
          </button>
        </form>
      </div>

      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            className="peak-admin__command-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setPaletteOpen(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="command-title"
              className="peak-admin__command"
              initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="peak-admin__command-search">
                <Command className="size-4" aria-hidden="true" />
                <label className="sr-only" htmlFor="admin-command-search">Быстрый переход</label>
                <input
                  id="admin-command-search"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Куда перейти?"
                />
                <button type="button" onClick={() => setPaletteOpen(false)} aria-label="Закрыть">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p id="command-title" className="peak-admin__command-label">Разделы CMS</p>
              <div className="peak-admin__command-list">
                {filteredCommands.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        setPaletteOpen(false);
                        setQuery("");
                        router.push(item.href);
                      }}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span>
                        <strong>{item.label}</strong>
                        <small>{formatTypography(item.description)}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
