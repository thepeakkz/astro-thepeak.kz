"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Command,
  ExternalLink,
  FileText,
  FolderOpen,
  Inbox,
  LogOut,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { formatTypography } from "@/utils/typography";

const commandItems = [
  { href: "/admin", label: "Страницы", description: "Основные страницы и разделы сайта", icon: FileText, category: "Навигация" },
  { href: "/admin/cases", label: "Кейсы", description: "Портфолио и карточки проектов", icon: FolderOpen, category: "Навигация" },
  { href: "/admin/crm", label: "Заявки", description: "Новые входящие лиды с сайта", icon: Inbox, category: "Продажи" },
  { href: "/admin/analytics", label: "Аналитика", description: "Трафик, конверсии и лимиты R2", icon: BarChart3, category: "Аналитика" },
  { href: "/admin/trash", label: "Корзина", description: "Восстановление удалённых страниц", icon: Trash2, category: "Система" },
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

  const navLinks = [
    { href: "/admin", label: "Страницы", icon: FileText, active: isPages },
    { href: "/admin/cases", label: "Кейсы", icon: FolderOpen, active: isCases },
    { href: "/admin/crm", label: "Заявки", icon: Inbox, active: isCrm },
    { href: "/admin/trash", label: "Корзина", icon: Trash2, active: isTrash },
    { href: "/admin/analytics", label: "Аналитика", icon: BarChart3, active: isAnalytics },
  ];

  return (
    <header className="peak-admin__topbar" role="banner">
      {/* Логотип и Бренд */}
      <div className="flex items-center gap-4">
        <Link href="/admin" className="peak-admin__topbar-logo-wrap group">
          <span className="peak-admin__topbar-brand">
            THE<span>PEAK</span>
          </span>
          <span className="peak-admin__topbar-pill">CMS</span>
        </Link>
      </div>

      {/* Навигация в стиле Vercel Tabs — Light */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200" aria-label="CMS навигация">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                item.active
                  ? "text-slate-900 bg-white shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
              aria-current={item.active ? "page" : undefined}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Правая панель действий */}
      <div className="flex items-center gap-2">
        {/* Кнопка ⌘K в стиле Vercel */}
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 h-8 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-900 transition-all shadow-xs"
          aria-label="Открыть быстрый поиск (⌘K)"
        >
          <Search className="size-3.5 text-slate-500" aria-hidden="true" />
          <span className="hidden sm:inline">Перейти</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Открыть сайт */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-slate-900 hover:border-slate-300 transition-colors shadow-xs"
          title="Открыть сайт"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>

        {/* Выйти */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center justify-center w-8 h-8 text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shadow-xs"
            title="Выйти из системы"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
          </button>
        </form>
      </div>

      {/* Модальное окно Spotlight (⌘K) — Light */}
      <AnimatePresence>
        {paletteOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/40 backdrop-blur-sm"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPaletteOpen(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="command-title"
              className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {/* Поле поиска */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/60">
                <Command className="size-4 text-slate-500" aria-hidden="true" />
                <label className="sr-only" htmlFor="admin-command-search">Быстрый поиск</label>
                <input
                  id="admin-command-search"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Куда перейти или что найти?..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setPaletteOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  aria-label="Закрыть"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              {/* Список команд */}
              <div className="p-2 max-h-80 overflow-y-auto">
                <p id="command-title" className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Разделы панели
                </p>
                <div className="space-y-1">
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
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 group-hover:text-slate-900 group-hover:border-slate-300 transition-colors">
                            <Icon className="size-4" aria-hidden="true" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 block">
                              {item.label}
                            </span>
                            <span className="text-xs text-slate-500 block">
                              {formatTypography(item.description)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-slate-600 font-mono">
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
                  {filteredCommands.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-500">
                      Ничего не найдено по запросу «{query}»
                    </div>
                  )}
                </div>
              </div>

              {/* Футер палитры */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Используйте <kbd className="font-mono text-slate-600 bg-white border border-slate-200 px-1 rounded">Esc</kbd> для закрытия</span>
                <span>THE PEAK CMS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
