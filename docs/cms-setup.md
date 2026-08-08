# Настройка CMS

CMS работает на Supabase Auth/Postgres и Cloudflare R2. Адрес панели: `/admin`.

## 1. Supabase

1. Создайте проект Supabase.
2. Выполните SQL-миграции по порядку в SQL Editor:
   - `supabase/migrations/20260807000000_create_cms.sql` — таблицы, RLS и базовые блоки;
   - `supabase/migrations/20260807010000_import_existing_pages.sql` — импорт 45 существующих страниц и кейсов.
3. Создайте пользователя в Authentication → Users.
4. Назначьте ему защищённую роль администратора через SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@thepeak.kz';
```

Роль должна находиться именно в `app_metadata`, а не в изменяемом пользователем `user_metadata`.

Вторая миграция безопасна для повторного запуска: существующие страницы не дублируются, а уже сохранённый контент блоков не перезаписывается.

## 2. Cloudflare R2

1. Создайте R2 bucket и API token с правами Object Read & Write для этого bucket.
2. Подключите к bucket production-домен, например `media.thepeak.kz`, и укажите его в `R2_PUBLIC_URL`.
3. Добавьте CORS policy для прямой загрузки из браузера:

```json
[
  {
    "AllowedOrigins": ["https://thepeak.kz", "https://www.thepeak.kz", "http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Подписанный URL действует пять минут, ограничен одним объектом и фиксированным `Content-Type`. Секретные ключи R2 никогда не отправляются в браузер.

## 3. Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните значения. Эти же переменные добавьте в окружение deployment-платформы.

## 4. Старые медиа кейсов

Новая загрузка CMS и API галерей используют R2. API ищет медиа кейса по префиксу `cases/{slug}/`. Старый статический manifest временно остаётся fallback, чтобы сайт не потерял изображения и видео до физического переноса файлов.

Проверить объём миграции без изменений:

```bash
npm run migrate:media:r2
```

После заполнения R2-переменных загрузить найденные файлы и заменить старые URL в `src`:

```bash
npm run migrate:media:r2 -- --execute
```

Скрипт сначала загружает все объекты и только после успешной загрузки обновляет исходники. Сделайте резервную копию или отдельный git-коммит перед запуском.

## 5. Дублирование Cloudinary → Cloudflare R2 и Fallback

Все новые файлы из CMS отправляются исключительно в **Cloudflare R2**. Для сохранения старых файлов доступен процесс дублирования с резервным источником (fallback) на Cloudinary.

1. **Дублирование файлов из Cloudinary в R2**:
   Проверить найденные ссылки без загрузки (dry-run):
   ```bash
   npm run duplicate:media:r2
   ```

   Загрузить файлы в R2 и обновить файл сопоставлений `src/data/cloudinary-r2-mapping.json`:
   ```bash
   npm run duplicate:media:r2 -- --execute
   ```

2. **Резервный источник (Fallback)**:
   При загрузке медиа сайт использует R2 как первичный источник. Если файл недоступен или выдаёт ошибку загрузки, видео и изображения автоматически переключаются на резервный URL Cloudinary.

3. **WebP-превью (постеры) для видео в CMS**:
   В админ-панели (`/admin`) при редактировании медиа кейса у каждого видео есть отдельное поле для загрузки и замены **WebP-обложки (постера)**. All WebP posters save directly to Cloudflare R2.

