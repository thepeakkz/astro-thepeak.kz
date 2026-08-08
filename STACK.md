# Технологический стек thepeak.kz

## Основа

- **Next.js 16.2.9** — App Router, Server Components, Route Handlers, SSG и динамические серверные маршруты.
- **React 19.2.4** и **React DOM 19.2.4**.
- **TypeScript 5** — строгий режим (`strict: true`), алиас `@/*` указывает на `src/*`.
- **Node.js 20.9+** — минимальная версия, требуемая текущей версией Next.js.
- **npm** — менеджер пакетов; версии зависимостей фиксируются в `package-lock.json`.
- **Turbopack** — сборщик для разработки и production-сборки Next.js.

## Интерфейс и стили

- **Tailwind CSS 4** через `@tailwindcss/postcss`.
- **shadcn 4** с компонентами на базе **Radix UI** и CSS-переменных.
- **tw-animate-css** — CSS-анимации.
- **tailwind-merge**, **clsx**, **class-variance-authority** — формирование и объединение CSS-классов.
- **styled-components 6** — доступен для компонентных стилей.
- **Inter Display** — локальный шрифт через `next/font/local`.
- Иконки: **Lucide React**, **Tabler Icons React** и **React Icons**.

## Анимация и интерактивность

- **Framer Motion / Motion** — переходы страниц и анимации компонентов.
- **Lenis** — плавная прокрутка.
- **Three.js**, **React Three Fiber** и **React Three Drei** — 3D-графика и интерактивные визуализации.
- **GSAP** и `@gsap/react` установлены как дополнительные инструменты анимации.

## Контент и медиа

- Редактируемые страницы и блоки хранятся в **Supabase Postgres** с включённым RLS.
- Защищённая панель `/admin` использует **Supabase Auth** и роль `app_metadata.role = admin`.
- Старые кейсы и метаданные пока хранятся в TypeScript-файлах внутри `src/data`.
- Локальные изображения и видео находятся в `public`.
- Новые изображения и видео хранятся в **Cloudflare R2** и раздаются через публичный custom domain.
- **AWS S3 SDK** создаёт короткоживущие подписанные URL для прямой загрузки файлов в R2.
- **React Player** и нативное HTML-видео доступны для воспроизведения медиа.
- **react-masonry-css** используется для masonry-раскладок.
- **dnd-kit** используется для сортировки блоков в редакторе.
- **Notion API Client** установлен, но прямое использование в текущем `src` не обнаружено.

## Серверная часть и интеграции

Backend реализован Route Handlers внутри `src/app/api`:

- `POST /api/contact` отправляет заявку в **Telegram Bot API** и создаёт карточку в **Trello API**.
- `POST /api/admin/media/sign` выдаёт авторизованному администратору подписанный URL для загрузки в R2.
- `GET /api/case-videos` объединяет медиа из **Cloudflare R2**, локальных файлов и временного статического manifest-файла.
- Для работы с файловой системой маршрут медиа использует Node.js runtime.

## SEO и аналитика

- Metadata API Next.js.
- Open Graph и Twitter Card metadata.
- Canonical URL, `robots.txt` и `sitemap.xml`.
- JSON-LD со структурированными данными сайта и организации.
- **Meta Pixel** подключён через `next/script`.

## Развёртывание

- Проект связан с **Vercel** через локальную папку `.vercel`.
- Production-сборка создаётся командой `npm run build`.
- Статические страницы генерируются заранее, API-маршруты выполняются на сервере по запросу.

## Переменные окружения

Секреты должны храниться в `.env.local` локально и в настройках окружения Vercel. Они не должны попадать в Git.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

TRELLO_API_KEY=
TRELLO_TOKEN=
TRELLO_LIST_ID=

TINIFY_API_KEY=
```

## Структура проекта

```text
src/
  app/          страницы, layouts и API Route Handlers
  components/   UI-компоненты и интерактивные блоки
  config/       общая конфигурация приложения
  data/         данные кейсов и manifest медиа
  lib/          SEO и общие вспомогательные функции
  utils/        утилиты, включая русскую типографику
public/         статические изображения, видео и логотипы
docs/           техническая документация проекта
```

## Основные команды

```bash
npm install       # установить зависимости
npm run dev       # запустить локальную разработку
npm run build     # проверить и собрать production-версию
npm run start     # запустить собранную production-версию
npm run lint      # запустить ESLint
```
