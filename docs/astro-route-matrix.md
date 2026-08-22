# Astro route matrix

Дата инвентаризации: 2026-08-23.

| Route | Source | Astro mode | Data | Notes |
| --- | --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | SSR | Supabase + local cases | React island, CMS fallback preserved |
| `/cases` | `src/app/cases/page.tsx` | SSR | Supabase + local cases | CMS ordering and hidden cases preserved |
| `/cases/[slug]` | managed + legacy cases | SSR | Supabase + R2 + manifest | Fullscreen video gallery preserved |
| `/privacy` | native page | SSR | CMS visibility gate | Static React render |
| `/services/web` | native page | SSR | local + contact API | Form preserved |
| `/site-development` | native page | SSR | CMS visibility gate | React island |
| `/site-development/memo` | native page | SSR | local | React island |
| `/gallery` | hidden native page | SSR/404 | CMS visibility gate | Visibility flag preserved |
| `/web` | hidden native page | SSR/404 | CMS visibility gate | Visibility flag preserved |
| `/team/sofya` | hidden native page | SSR/404 | local | Visibility flag preserved |
| `/[slug]` | CMS page | SSR | Supabase | Unknown slugs return 404 |
| `/api/contact` | public API | server endpoint | Supabase + Telegram | CRM write occurs before notification |
| `/api/analytics/events` | public API | server endpoint | Supabase | Input sanitation and bot filtering preserved |
| `/api/case-videos` | public API | server endpoint | R2 + manifest + local | Legacy media resolver reused |
| `/api/brief` | public API | server endpoint | none | Preserves 410 response |
| `/admin/**` | legacy Next.js | rewrite | Supabase Auth | Astro does not inspect the session |
| `/api/admin/**` | legacy Next.js | rewrite | Supabase/R2 | Remains in the same Next.js zone |

The legacy Next.js source remains deployable from the repository root. The Astro public zone is built from `apps/astro-site`.
