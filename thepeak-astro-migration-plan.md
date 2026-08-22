# System Context for AI Agent
**Role:** Senior DevOps / Full-Stack Engineer migrating a Next.js application to Astro.
**Project:** thepeak.kz
**Architecture Goal:** Multi-zone deployment (Astro for public pages, Next.js for `/admin` and `/api/admin`).
**Execution Rule:** Strict adherence to staging, zero data loss, fallback availability, and isolated UI components (React Islands). Do NOT destructively modify legacy Next.js code.

---

# Полный обновлённый план переноса thepeak.kz с Next.js на Astro

## 1. Цель миграции

Перенести публичную часть сайта на Astro, сохранив:
- текущие URL;
- внешний вид и анимации;
- SEO и индексацию;
- CMS-контент;
- формы заявок;
- аналитику и UTM;
- Supabase;
- Cloudflare R2;
- Telegram и Trello;
- возможность быстрого отката.

На первом этапе административная панель и административные API остаются на Next.js:

```text
Astro
├── /
├── /cases/**
├── /services/**
├── /site-development/**
├── /web
├── /gallery
├── /privacy
├── публичные API
└── SEO, sitemap, robots

Next.js legacy
├── /admin/**
├── /api/admin/**
├── Next Server Actions
├── Supabase Auth
└── административная загрузка медиа
```

Это снижает срок первой миграции примерно до 5–8 недель и убирает самый рискованный перенос интерактивной CMS.

---

## 2. Основные инженерные принципы

1. **Immutable Legacy:** Существующий Next.js не изменяется необратимо.
2. **Parallel Dev:** Astro разрабатывается параллельно (monorepo или separate dir).
3. **Rollback First:** Production переключается только после репетиции отката.
4. **Shared Data:** Supabase и R2 не мигрируются на первом этапе — обе версии используют существующие сервисы.
5. **Zone Isolation:** Админка и административные API остаются в одной Next.js-зоне.
6. **Incremental Adoption:** Публичные страницы переносятся по одной.
7. **Island Architecture:** Сложные React-компоненты сначала переиспользуются, затем при необходимости дробятся на острова.
8. **Retention Policy:** Старый production deployment сохраняется минимум 60–90 дней.
9. **No Early Deletion:** Никакое удаление данных, Cloudinary-ресурсов или legacy-кода не выполняется до завершения стабилизации.

---

## 3. Целевая архитектура

```text
                        ┌───────────────────────┐
                        │      thepeak.kz       │
                        │  Vercel Edge Router   │
                        └───────────┬───────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
             публичные маршруты              служебные маршруты
                     │                             │
                     ▼                             ▼
          ┌────────────────────┐       ┌──────────────────────┐
          │    Astro project   │       │ Legacy Next.js      │
          │                    │       │                      │
          │ public pages       │       │ /admin/**           │
          │ public API         │       │ /api/admin/**       │
          │ React Islands      │       │ Server Actions      │
          │ ClientRouter       │       │ Supabase Auth       │
          └─────────┬──────────┘       └──────────┬───────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   ▼
                  ┌────────────────────────────────┐
                  │ Общая инфраструктура           │
                  │                                │
                  │ Supabase Postgres              │
                  │ Cloudflare R2                  │
                  │ Telegram API                   │
                  │ Trello API                     │
                  │ Tinify                         │
                  └────────────────────────────────┘
```

---

## 4. Этап 0. Зафиксировать текущее состояние
**Срок:** 1–2 дня.

До резервного копирования составить паспорт production:
- Git branch & SHA production-коммита;
- Текущий Vercel production deployment;
- Список доменов и DNS-записи;
- Supabase project ID;
- R2 bucket и custom domain;
- Cloudinary cloud name;
- Список Production/Preview/Development env;
- Telegram bot/chat ID & Trello board/list ID;
- Meta Pixel и аналитические идентификаторы;
- Список CMS-страниц, количество лидов, количество объектов R2;
- Текущий sitemap, список редиректов;
- Текущие показатели Web Vitals.

**Критерии успеха (SLA):**
- Простой при переключении — не более 10–15 минут;
- Откат — не более 30 минут;
- Потеря данных — нулевая;
- RPO резервной копии перед cutover — не более 15 минут.

**Baseline-проверки:**
```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e
```
*Примечание для AI:* Все текущие ошибки фиксируются как known issues.

---

## 5. Этап 1. Полный резервный контур
**Срок:** 1–2 дня.

### 5.1. Git backup
```bash
git rev-parse HEAD
git status --short
git tag pre-astro-migration-2026-08-22
git bundle create thepeak-pre-astro.bundle --all
git bundle verify thepeak-pre-astro.bundle
```

### 5.2. Backup локальных файлов
Архивировать `public/`, `src/data/`, `supabase/migrations/`, `scripts/`, шрифты, hero-медиа, `cloudinary-r2-mapping.json`, `case-media-manifest.ts`.
```bash
shasum -a 256 thepeak-files-backup.tar.gz
```

### 5.3. Backup Supabase
```bash
supabase db dump --db-url "$SUPABASE_DATABASE_URL" -f roles.sql --role-only
supabase db dump --db-url "$SUPABASE_DATABASE_URL" -f schema.sql
supabase db dump --db-url "$SUPABASE_DATABASE_URL" -f data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
supabase db diff --linked --schema auth,storage > auth-storage-changes.sql
```
*Action:* Создать temp Supabase-проект, восстановить данные, проверить RLS и вход.

### 5.4. Backup Cloudflare R2
```bash
rclone copy r2:production-bucket backup:thepeak-r2-2026-08-22 --progress --checksum
rclone check r2:production-bucket backup:thepeak-r2-2026-08-22
```

### 5.5. Cloudinary & Vercel & DNS backups
- Сохранить Vercel env vars зашифрованно.
- Экспортировать DNS, уменьшить TTL до 300 секунд за сутки до cutover.
- Сохранить Cloudinary mapping, не удалять ресурсы 60 дней.

---

## 6. Этап 2. Полная инвентаризация маршрутов
**Срок:** 2–4 дня.

**Route Matrix:**
| Маршрут | Режим | Данные | Интерактивность | Целевой режим |
|---|---|---|---|---|
| `/` | ISR | Supabase + local | высокая | SSR/hybrid |
| `/cases` | dynamic | Supabase + legacy | средняя | SSR |
| `/cases/[slug]` | SSG/CMS | Supabase + TS | высокая | hybrid |
| `/privacy` | static | TSX | низкая | prerender |
| `/admin/**` | SSR | Supabase | высокая | оставить Next |
| `/api/admin/**`| server | Supabase/R2 | — | оставить Next |

**Поиск Next-зависимостей (Agent Task):**
```bash
rg "next/(navigation|router|link|image|dynamic|script|font)" src
rg "useRouter|usePathname|useSearchParams|redirect|notFound" src
rg ""use server"|"use client"" src
```

---

## 7. Этап 3. Технический spike
**Срок:** 3–5 дней.

**Цель:** Создать минимальный прототип.
- Astro на Vercel + Tailwind 4 + React integration;
- persistent React island (R3F/WebGL, Lenis);
- Vercel rewrite на legacy Next (`/admin`);
- Переход Astro → `/admin` и обратно.

---

## 8. Этап 4. Структура Astro-проекта
**Срок:** 2–4 дня.

**Monorepo-структура:**
```text
apps/
  astro-site/
  next-legacy/
packages/
  shared/
  data/
  schemas/
  ui/
supabase/
public/
```

---

## 9. Этап 5. Общая инфраструктура UI
**Срок:** 3–5 дней.

| Next.js | Astro |
|---|---|
| `layout.tsx` | `layouts/BaseLayout.astro` |
| `next/image` | `astro:assets` |
| `next/link` | `<a>` или adapter |
| Route Handler | Astro endpoint |

---

## 10. Этап 6. Compatibility layer
Создать `src/compat/` (AppLink, useCurrentLocation, media adapters).
*Правило для AI:* В Astro React Islands не должно быть импортов из `next/*`.

---

## 11. Этап 7. ClientRouter, WebGL и Lenis
Использовать `<ClientRouter />` из `astro:transitions`.
Для WebGL/Lenis: `<GlobalScene client:load transition:persist="global-scene" />`

---

## 12. Этап 8. Shared state между островами
Использовать **Nano Stores** для связи между изолированными островами. React Context внутри одного острова допустим, между островами — нет.

---

## 13. Этап 9. Перенос публичных страниц
**Срок:** 10–15 рабочих дней.
*Порядок:* `/privacy` → `/gallery` → `/web` → `/cases/[slug]` → `/`.

---

## 14. Этап 10. Изображения и медиа
- `next/image` → `astro:assets`.
- WebP по умолчанию.
- Tinify только для новых загрузок.

---

## 15. Этап 11. Публичные API
Перенести `/api/contact`, `/api/analytics/events`, `/api/case-videos`.
*Оставить в Next:* `/api/admin/*`.

---

## 16. Этап 12. Vercel Multi-Zones
`vercel.json` в Astro проекте:
```json
{
  "rewrites": [
    { "source": "/admin", "destination": "https://legacy-admin.thepeak.kz/admin" },
    { "source": "/admin/:path*", "destination": "https://legacy-admin.thepeak.kz/admin/:path*" },
    { "source": "/api/admin/:path*", "destination": "https://legacy-admin.thepeak.kz/api/admin/:path*" },
    { "source": "/admin-static/:path*", "destination": "https://legacy-admin.thepeak.kz/admin-static/:path*" }
  ]
}
```

---

## 17. Этап 13-17. Тестирование и Запуск
- **Этап 13 (Auth):** Astro не интерпретирует admin session.
- **Этап 14 (SEO):** ClientRouter pageview event.
- **Этап 15 (QA):** Viewport matrix, WebGL leaks, 50-cycle memory tests.
- **Этап 16 (Dry Run):** Тестовый прогон на staging с замером времени отката.
- **Этап 17 (Cutover):** Content freeze 15-30 мин, DB dump, Vercel domain switch.

---

## Условия немедленного отката
Массовые 404, не работают формы/лиды, администратор не может войти, поломка загрузки R2, критические WebGL crashes.

**Процедура отката:** Switch Vercel domain alias обратно на Next deployment. Восстановление БД требуется только при физическом повреждении данных.
