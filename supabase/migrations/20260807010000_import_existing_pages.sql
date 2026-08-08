alter table public.pages
  add column if not exists route_path text,
  add column if not exists page_kind text not null default 'builder',
  add column if not exists is_system boolean not null default false;

update public.pages
set route_path = '/' || slug
where route_path is null;

alter table public.pages alter column route_path set not null;
alter table public.pages drop constraint if exists pages_slug_check;
alter table public.pages drop constraint if exists pages_route_path_check;
alter table public.pages drop constraint if exists pages_page_kind_check;
alter table public.pages
  add constraint pages_slug_check check (
    slug ~ '^[a-z0-9]+([-/][a-z0-9]+)*$'
    and char_length(slug) <= 160
  ),
  add constraint pages_route_path_check check (
    route_path = '/'
    or (route_path ~ '^(/[a-z0-9]+(-[a-z0-9]+)*)+$' and char_length(route_path) <= 180)
  ),
  add constraint pages_page_kind_check check (page_kind ~ '^[a-z][a-z0-9_]*$');

create unique index if not exists pages_route_path_key on public.pages(route_path);

alter table public.blocks
  add column if not exists page_kinds text[] not null default array['builder']::text[];

update public.blocks
set page_kinds = array['builder']::text[]
where type in ('hero', 'text', 'media', 'cta');

insert into public.blocks (type, name, description, fields, default_content, page_kinds)
values
  (
    'home_hero',
    'Первый экран',
    'Главный экран существующей домашней страницы.',
    '[
      {"name":"title","label":"Заголовок на компьютере","type":"textarea","required":true},
      {"name":"mobileTitle","label":"Заголовок на телефоне","type":"textarea","required":true},
      {"name":"description","label":"Описание","type":"textarea","required":true},
      {"name":"buttonLabel","label":"Текст кнопки","type":"text","required":true},
      {"name":"buttonUrl","label":"Ссылка кнопки","type":"url","required":true},
      {"name":"desktopVideoUrl","label":"Фоновое видео для компьютера","type":"media","accept":"video/*"},
      {"name":"mobileVideoUrl","label":"Фоновое видео для телефона","type":"media","accept":"video/*"},
      {"name":"posterUrl","label":"Заставка видео","type":"media","accept":"image/*"}
    ]'::jsonb,
    '{"title":"Маркетинг, который работает\nот идеи до результата","mobileTitle":"Маркетинг,\nкоторый работает\nот идеи до готового\nрезультата","description":"Приходите к нам с задачей «сделать не как у всех».\nМы создаём маркетинг, который становится референсом для других.","buttonLabel":"оставить заявку","buttonUrl":"#contacts","desktopVideoUrl":"/bg.webm","mobileVideoUrl":"/bg-mobile-fast.mp4","posterUrl":"/bg-mobile-poster.jpg"}'::jsonb,
    array['home']::text[]
  ),
  ('home_stats', 'Показатели', 'Статистика на мобильных устройствах.', '[]'::jsonb, '{}'::jsonb, array['home']::text[]),
  ('home_clients', 'Логотипы клиентов', 'Бегущая строка логотипов клиентов.', '[]'::jsonb, '{}'::jsonb, array['home']::text[]),
  ('home_services', 'Услуги', 'Интерактивный список направлений агентства.', '[]'::jsonb, '{}'::jsonb, array['home']::text[]),
  ('home_work_cases', 'Этапы и кейсы', 'Связанная анимированная секция этапов и кейсов.', '[]'::jsonb, '{}'::jsonb, array['home']::text[]),
  (
    'home_team',
    'Команда',
    'Команда и вводный текст секции.',
    '[
      {"name":"heading","label":"Заголовок","type":"textarea","required":true},
      {"name":"description","label":"Описание","type":"textarea","required":true}
    ]'::jsonb,
    '{"heading":"Каждое направление\nThePeak возглавляет специалист с практическим опытом в своей области","description":"Вы работаете не просто с безликими подрядчиками, а с людьми, которые принимают ключевые решения, глубоко погружаются в ваш бизнес и несут личную ответственность за конечный результат."}'::jsonb,
    array['home']::text[]
  ),
  (
    'home_contact',
    'Контакты и форма',
    'Финальная форма обратной связи.',
    '[
      {"name":"title","label":"Заголовок","type":"text","required":true},
      {"name":"description","label":"Описание","type":"textarea","required":true}
    ]'::jsonb,
    '{"title":"Связаться с нами","description":"Если у вас есть вопросы по нашим услугам или вы хотите обсудить проект, пожалуйста, заполните форму. Мы ответим вам в течение 1 рабочего дня."}'::jsonb,
    array['home']::text[]
  ),
  (
    'cases_hero',
    'Заголовок каталога',
    'Первый экран страницы кейсов.',
    '[
      {"name":"title","label":"Заголовок","type":"text","required":true},
      {"name":"description","label":"Описание","type":"textarea","required":true}
    ]'::jsonb,
    '{"title":"Кейсы","description":"Проекты, разработанные нашей командой: от комплексного SMM до масштабного видеопроизводства."}'::jsonb,
    array['cases']::text[]
  ),
  ('cases_grid', 'Каталог проектов', 'Сетка кейсов и фильтры по услугам.', '[]'::jsonb, '{}'::jsonb, array['cases']::text[]),
  (
    'case_page',
    'Содержание кейса',
    'Основные тексты и медиа существующей страницы кейса.',
    '[
      {"name":"title","label":"Название проекта","type":"text","required":true},
      {"name":"year","label":"Год или период","type":"text"},
      {"name":"service","label":"Услуга","type":"text","required":true},
      {"name":"industry","label":"Отрасль","type":"text","required":true},
      {"name":"description","label":"Краткое описание (Hero)","type":"textarea","required":true},
      {"name":"descCol1","label":"Подробное описание (Левая колонка / Задача)","type":"textarea"},
      {"name":"descCol2","label":"Подробное описание (Правая колонка / Результат)","type":"textarea"},
      {"name":"brandbookUrl","label":"Презентация / Брендбук в формате PDF","type":"media","accept":"application/pdf,.pdf"},
      {"name":"profileUrl","label":"Ссылка на профиль или сайт","type":"url"},
      {"name":"heroType","label":"Тип обложки","type":"select","options":[{"label":"Изображение","value":"image"},{"label":"Видео","value":"video"}]},
      {"name":"heroUrl","label":"Обложка","type":"media","accept":"image/*,video/*","mediaTypeField":"heroType","required":true}
    ]'::jsonb,
    '{"title":"Название проекта","year":"","service":"","industry":"","description":"","descCol1":"","descCol2":"","brandbookUrl":"","profileUrl":"","heroType":"image","heroUrl":""}'::jsonb,
    array['case']::text[]
  ),
  (
    'native_page',
    'Текущая верстка страницы',
    'Защищённый блок сложной существующей страницы.',
    '[]'::jsonb,
    '{}'::jsonb,
    array['native']::text[]
  )
on conflict (type) do update set
  name = excluded.name,
  description = excluded.description,
  fields = excluded.fields,
  default_content = excluded.default_content,
  page_kinds = excluded.page_kinds,
  is_active = true;

insert into public.pages (slug, route_path, title, seo_title, seo_description, status, published_at, page_kind, is_system)
values
  ('home', '/', 'Главная', 'ThePeak — маркетинговое агентство', 'Маркетинговое агентство полного цикла в Казахстане.', 'published', now(), 'home', true),
  ('cases', '/cases', 'Кейсы', 'Кейсы ThePeak', 'Проекты ThePeak по маркетингу, SMM, брендингу, разработке и продакшну.', 'published', now(), 'cases', true),
  ('gallery', '/gallery', 'Галерея', 'Галерея ThePeak', 'Визуальные проекты и контент ThePeak.', 'published', now(), 'native', true),
  ('privacy', '/privacy', 'Политика конфиденциальности', 'Политика конфиденциальности — ThePeak', 'Политика обработки персональных данных.', 'published', now(), 'native', true),
  ('web', '/web', 'Разработка сайтов', 'Разработка сайтов — ThePeak', 'Разработка сайтов и digital-продуктов.', 'published', now(), 'native', true),
  ('site-development', '/site-development', 'Разработка сайтов под ключ', 'Разработка сайтов под ключ — ThePeak', 'Разработка сайтов от стратегии до запуска и продвижения.', 'published', now(), 'native', true),
  ('site-development/memo', '/site-development/memo', 'Памятка по странице разработки', 'Памятка по странице разработки — ThePeak', 'Служебная памятка по стилям страницы.', 'published', now(), 'native', true),
  ('team/sofya', '/team/sofya', 'Коломеец Софья', 'Коломеец Софья — ThePeak', 'Маркетинговые и продакшн-проекты Софьи Коломеец.', 'published', now(), 'native', true)
on conflict (slug) do update set
  route_path = excluded.route_path,
  page_kind = excluded.page_kind,
  is_system = true;

do $$
declare
  home_page_id uuid;
  cases_page_id uuid;
  native_page_slug text;
  seed jsonb;
  seeded_page_id uuid;
  case_seed jsonb := $cases$[{"slug":"cases/lukoil","path":"/cases/lukoil","title":"Lukoil Lubricants","year":"2025","service":"SMM","industry":"Производство","description":"Выстроили современную коммуникацию для крупного бренда: Instagram, TikTok, YouTube, дизайн для дрифт-команды и рост охватов.","profileUrl":"https://www.instagram.com/lukoil.lubricants.kz/","heroUrl":"/cases/lukoil.mp4","heroType":"video"},{"slug":"cases/sensata","path":"/cases/sensata","title":"Sensata","year":"2025","service":"Продакшн","industry":"Недвижимость","description":"Визуальный контент для застройщика: архитектурные ракурсы, динамичные ролики и материалы, которые повышают доверие к бренду.","profileUrl":"https://www.instagram.com/sensata_almaty/","heroUrl":"/cases/sensata.webp","heroType":"image"},{"slug":"cases/diskokras","path":"/cases/diskokras","title":"Diskokras","year":"Ноябрь 2024","service":"SMM, Маркетинг","industry":"Автосервис","description":"Построили личный бренд вокруг владельца, organic рост и живое комьюнити вместо обычной страницы сервиса.","profileUrl":"","heroUrl":"/cases/diskokras/DNQp7cUI2Fs.mp4","heroType":"video"},{"slug":"cases/shanding-logistics","path":"/cases/shanding-logistics","title":"Shanding","year":"2024","service":"Лендинг, полиграфия","industry":"Логистика","description":"Лендинг для логистической компании Shanding: уход от стоковых фотографий, уникальные иллюстрации и китайская графика.","profileUrl":"https://shanding.kz/","heroUrl":"https://res.cloudinary.com/dxvynbrut/image/upload/v1783590405/cases/shanding-logistics/cover.webp","heroType":"image"},{"slug":"cases/compass","path":"/cases/compass","title":"Compass","year":"2022–2023","service":"Сайт, брендинг","industry":"Консалтинг","description":"Разработка бренда и сайта для консалтинговой компании №1 в Узбекистане: строгая геометрия, B2B-интерфейс и трансляция надежности.","profileUrl":"https://compass.uz/","heroUrl":"https://res.cloudinary.com/dxvynbrut/image/upload/v1783492782/cases/compass/cover.webp","heroType":"image"},{"slug":"cases/puma","path":"/cases/puma","title":"Puma Kazakhstan","year":"2024","service":"SMM","industry":"Ритейл","description":"Контент и коммуникация для спортивного ритейла: работали с узнаваемостью, сообществом и актуальными digital-форматами.","profileUrl":"https://www.instagram.com/puma_fam_kz/","heroUrl":"/cases/puma.webp","heroType":"image"},{"slug":"cases/gippo","path":"/cases/gippo","title":"Gippo","year":"2024","service":"SMM, Таргет","industry":"Фаст-фуд","description":"Построили дерзкий street food-бренд в Instagram и TikTok: viral-контент, офлайн-активации и механики роста продаж.","profileUrl":"https://www.instagram.com/gippo.kz","heroUrl":"/cases/gippo.webp","heroType":"image"},{"slug":"cases/bazisa","path":"/cases/bazisa","title":"Bazis A","year":"2025","service":"Продакшн","industry":"Недвижимость","description":"Видео и digital-контент для застрощика: показали масштаб проектов, детали продукта и атмосферу жилой среды.","profileUrl":"https://www.instagram.com/bazis.kz/","heroUrl":"/cases/bazis a.mp4","heroType":"video"},{"slug":"cases/velmar","path":"/cases/velmar","title":"Velmar","year":"2025","service":"SMM","industry":"Автосервис","description":"Системная коммуникация для автосервиса: упаковка экспертности, контент для доверия и регулярные поводы для обращений.","profileUrl":"https://www.instagram.com/velmar_kz/reels/","heroUrl":"/cases/Velmar.webp","heroType":"image"},{"slug":"cases/racoon","path":"/cases/racoon","title":"Raccoon Tyres","year":"2025","service":"SMM","industry":"Автосервис","description":"Продвижение автосервиса через понятный контент, экспертные форматы и визуальную подачу, которая помогает выбирать услугу.","profileUrl":"https://www.instagram.com/sale_tyre/","heroUrl":"/cases/raccoon.mp4","heroType":"video"},{"slug":"cases/onmacabim","path":"/cases/onmacabim","title":"ONmacabim","year":"2024","service":"SMM, Маркетинг","industry":"Косметология","description":"Стратегия и контент для косметологического бренда: аккуратная экспертная коммуникация, доверие и работа с аудиторией.","profileUrl":"https://www.instagram.com/onmacabim_cosmetic.kz","heroUrl":"/cases/onmacabim.webp","heroType":"image"},{"slug":"cases/bebble","path":"/cases/bebble","title":"Bebble","year":"2022","service":"Сайт","industry":"Косметика","description":"Онлайн-витрина для болгарского бренда детской косметики Bebble: мягкая пастельная гамма, забота и удобный поиск.","profileUrl":"https://bebble.kz/","heroUrl":"https://res.cloudinary.com/f75p1yiv/image/upload/v1782998842/yapil/case/bebble.webp","heroType":"image"},{"slug":"cases/mindofbody","path":"/cases/mindofbody","title":"Mind of Body","year":"2024","service":"SMM","industry":"Фитнес","description":"Контент для фитнес-проекта: передали атмосферу тренировок, ценность подхода и живую коммуникацию с клиентами.","profileUrl":"https://www.instagram.com/mindofbody.almaty/","heroUrl":"/cases/mob.webp","heroType":"image"},{"slug":"cases/cadillac","path":"/cases/cadillac","title":"Cadillac","year":"2025","service":"SMM","industry":"Автосалон","description":"Контент для премиального автосалона: сохранили статус бренда и сделали коммуникацию понятной для локальной аудитории.","profileUrl":"https://www.instagram.com/cadillac.qazaqstan/","heroUrl":"/cases/cadillac.webp","heroType":"image"},{"slug":"cases/invictus-academy","path":"/cases/invictus-academy","title":"Invictus Academy","year":"2025","service":"Продакшн","industry":"Фитнес","description":"Видеопродакшн для фитнес-академии: сняли динамичный контент про тренировки, тренеров и атмосферу проекта.","profileUrl":"","heroUrl":"/cases/invictus-academy/%D1%86%D0%B2%D1%84%D1%8B%D0%B2.mp4","heroType":"video"},{"slug":"cases/ris","path":"/cases/ris","title":"Рис","year":"2025","service":"SMM","industry":"Ресторан","description":"Digital-коммуникация для ресторана: визуальный контент, регулярные рубрики и подача, которая работает на посещаемость.","profileUrl":"https://www.instagram.com/ris.nazarbaeva/reels/","heroUrl":"/cases/ris.mp4","heroType":"video"},{"slug":"cases/double-coffee","path":"/cases/double-coffee","title":"Double Coffee","year":"2025","service":"SMM","industry":"Ресторан","description":"SMM для ресторана: регулярный Reels-контент, живая подача продукта и коммуникация, которая работает на посещаемость.","profileUrl":"https://www.instagram.com/doublecoffee_almaty/","heroUrl":"/cases/double coffee.webp","heroType":"image"},{"slug":"cases/bossxo","path":"/cases/bossxo","title":"Bossxo","year":"2026","service":"SMM","industry":"Мебель","description":"SMM для мебельного бренда: визуальная подача продукта, контент для доверия и коммуникация, которая помогает выбирать изысканные решения.","profileUrl":"","heroUrl":"/cases/bossxo.webp","heroType":"image"},{"slug":"cases/blink","path":"/cases/blink","title":"Blink map","year":"2024","service":"SMM","industry":"Приложение","description":"Коммуникация для приложения: объяснили продукт, упаковали сценарии использования и усилили узнаваемость сервиса.","profileUrl":"https://www.instagram.com/blink_map.kz","heroUrl":"/cases/blink.webp","heroType":"image"},{"slug":"cases/avtopilot","path":"/cases/avtopilot","title":"Avtopilot","year":"2020","service":"SMM","industry":"Автосервис","description":"Контент для автосервиса и мотопроекта: показали процесс, экспертизу команды и поводы обратиться за услугой.","profileUrl":"https://www.instagram.com/avtopilot__service","heroUrl":"/cases/avtopilot.mp4","heroType":"video"},{"slug":"cases/ark","path":"/cases/ark","title":"ARK detailing","year":"2025","service":"SMM","industry":"Детейлинг","description":"Визуальный контент для детейлинга: акцент на деталях, качестве работ и доверии к мастерам через короткие видеоформаты.","profileUrl":"https://www.instagram.com/ark_detailing_alm/","heroUrl":"/cases/ark.mp4","heroType":"video"},{"slug":"cases/qazsip","path":"/cases/qazsip","title":"Qaz.sip","year":"2026","service":"Таргет","industry":"Строительство","description":"Таргетированная реклама для строительства домов из SIP-панелей: лид-формы, офферы и воронки под разные сегменты аудитории.","profileUrl":"","heroUrl":"/cases/qazsip.webp","heroType":"image"},{"slug":"cases/faw-kazakhstan","path":"/cases/faw-kazakhstan","title":"FAW Kazakhstan","year":"2023","service":"Таргет","industry":"Автомобили","description":"Лидогенерация для автомобильного бренда: масштабирование рекламных кампаний по городам Казахстана и стабильная работа с качеством заявок.","profileUrl":"","heroUrl":"/cases/faw-kazakhstan/cover.webp","heroType":"image"},{"slug":"cases/uaz","path":"/cases/uaz","title":"UAZ Kazakhstan","year":"2025","service":"Таргет","industry":"Автомобили","description":"Продвижение официального дистрибьютора УАЗ в Казахстане: охватные кампании, лидогенерация и оптимизация стоимости заявки.","profileUrl":"","heroUrl":"/cases/uaz.webp","heroType":"image"},{"slug":"cases/gippo-target","path":"/cases/gippo-target","title":"GIPPO","year":"2026","service":"Таргет","industry":"Фаст-фуд","description":"Performance-продвижение street food-бренда: рост продаж, узнаваемости, трафика и потока новых пользователей.","profileUrl":"","heroUrl":"/cases/gippo.webp","heroType":"image"},{"slug":"cases/raccoon-tyres-target","path":"/cases/raccoon-tyres-target","title":"Raccoon Tyres","year":"2026","service":"Таргет","industry":"Шины и диски","description":"Таргетированная реклама для шин и дисков: повышение узнаваемости бренда, лиды, WhatsApp-обращения и переходы в профиль.","profileUrl":"","heroUrl":"/cases/raccoon.mp4","heroType":"video"},{"slug":"cases/uniflex-fitness","path":"/cases/uniflex-fitness","title":"UNIFLEX Fitness","year":"2026","service":"Таргет","industry":"Фитнес","description":"Рекламные кампании для фитнес-клуба: стабильный поток заявок, поддержка отдела продаж и рост узнаваемости.","profileUrl":"","heroUrl":"/cases/uniflex-fitness/cover.webp","heroType":"image"},{"slug":"cases/ris-target","path":"/cases/ris-target","title":"РИС","year":"2026","service":"Таргет","industry":"Ресторан","description":"Таргетированная реклама для ресторана и караоке: поток гостей, брони через Instagram и рост узнаваемости заведения.","profileUrl":"","heroUrl":"/cases/ris.mp4","heroType":"video"},{"slug":"cases/tinga-logistics","path":"/cases/tinga-logistics","title":"TINGA Logistics","year":"2026","service":"Контекстная реклама","industry":"Логистика","description":"Контекстная реклама для логистической компании: рост конверсий, качественный трафик и снижение стоимости обращения.","profileUrl":"","heroUrl":"/cases/tinga-logistics.webp","heroType":"image"},{"slug":"cases/mg-kazakhstan","path":"/cases/mg-kazakhstan","title":"MG Шымкент / Алматы","year":"2026","service":"Таргет","industry":"Автомобили","description":"Рекламные кампании для автомобильного бренда MG: лидогенерация, узнаваемость и стабильный поток обращений.","profileUrl":"","heroUrl":"https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782641221/mg2_ttzsip.mp4","heroType":"video"},{"slug":"cases/jac-shymkent","path":"/cases/jac-shymkent","title":"JAC Шымкент","year":"2026","service":"Таргет","industry":"Автомобили","description":"Лидогенерация для автомобильного бренда JAC: переработка офферов, лид-формы и рост продаж через поток заявок.","profileUrl":"","heroUrl":"/cases/jac-shymkent.webp","heroType":"image"},{"slug":"cases/kenfsad","path":"/cases/kenfsad","title":"Kenfsad","year":"2022","service":"SMM, продакшн, дизайн, WEB, маркетинг","industry":"Производство","description":"Комплексное digital-продвижение бренда KENFSAD: от разработки визуального стиля и веб-сайта до настройки таргетированной рекламы и создания контента.","profileUrl":"","heroUrl":"https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782641222/kf1_h9sr9l.mp4","heroType":"video"},{"slug":"cases/mg","path":"/cases/mg","title":"MG","year":"2025","service":"SMM, таргет","industry":"Автосалон","description":"Комплексная работа с социальными сетями и таргетированной рекламой для официального дилерского центра MG: от концепции контента до привлечения лидов.","profileUrl":"","heroUrl":"https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782641221/mg2_ttzsip.mp4","heroType":"video"},{"slug":"cases/omo","path":"/cases/omo","title":"Omo","year":"2024","service":"Продакшн","industry":"Бытовая химия","description":"Создание качественного видеоконтента и продакшн для бренда бытовой химии OMO: от идеи и сценария до финального монтажа.","profileUrl":"","heroUrl":"https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782641223/OMO_%D1%85_Almaty_marathon_1_oqdkmb.mp4","heroType":"video"},{"slug":"cases/boya","path":"/cases/boya","title":"Boya","year":"2022–2024","service":"Сайт, брендинг","industry":"Производство","description":"Комплексный запуск бренда лакокрасочных материалов с нуля: ломая консервативные стереотипы о строительном рынке.","profileUrl":"","heroUrl":"https://res.cloudinary.com/f75p1yiv/image/upload/v1782998699/yapil/case/Boya.webp","heroType":"image"},{"slug":"cases/rv","path":"/cases/rv","title":"Рыкунов и Кудряшов","year":"2023","service":"Лендинг","industry":"Продюсирование","description":"Премиальный лендинг для закрытой программы менторства: строгая монументальность, глубокий черный цвет и благородное золото.","profileUrl":"","heroUrl":"https://res.cloudinary.com/f75p1yiv/image/upload/v1782998834/yapil/case/RV/1.webp","heroType":"image"},{"slug":"cases/igorkochergin","path":"/cases/igorkochergin","title":"Игорь Кочергин","year":"2025","service":"Лендинг","industry":"Трейдинг","description":"Премиальный лендинг для программы менторства Игоря Кочергина: монументальное матовое золото, строгая геометрия и логика воронки.","profileUrl":"https://igvestor.ru/new","heroUrl":"https://res.cloudinary.com/f75p1yiv/image/upload/v1782998845/yapil/case/%D0%98%D0%B3%D0%BE%D1%80%D1%8C%20%D0%9A%D0%BE%D1%87%D0%B5%D1%80%D0%B3%D0%B8%D0%BD.webp","heroType":"image"}]$cases$::jsonb;
begin
  select id into home_page_id from public.pages where slug = 'home';
  if not exists (select 1 from public.page_blocks where page_id = home_page_id) then
    insert into public.page_blocks (page_id, block_id, sort_order, content)
    select home_page_id, block.id, seed_item.sort_order, block.default_content
    from (values
      ('home_hero', 0),
      ('home_stats', 1),
      ('home_clients', 2),
      ('home_services', 3),
      ('home_work_cases', 4),
      ('home_team', 5),
      ('home_contact', 6)
    ) as seed_item(block_type, sort_order)
    join public.blocks block on block.type = seed_item.block_type;
  end if;

  select id into cases_page_id from public.pages where slug = 'cases';
  if not exists (select 1 from public.page_blocks where page_id = cases_page_id) then
    insert into public.page_blocks (page_id, block_id, sort_order, content)
    select cases_page_id, block.id, seed_item.sort_order, block.default_content
    from (values ('cases_hero', 0), ('cases_grid', 1)) as seed_item(block_type, sort_order)
    join public.blocks block on block.type = seed_item.block_type;
  end if;

  foreach native_page_slug in array array['gallery', 'privacy', 'web', 'site-development', 'site-development/memo', 'team/sofya']
  loop
    select id into seeded_page_id from public.pages where slug = native_page_slug;
    if not exists (select 1 from public.page_blocks where page_id = seeded_page_id) then
      insert into public.page_blocks (page_id, block_id, sort_order, content)
      select seeded_page_id, id, 0, default_content from public.blocks where type = 'native_page';
    end if;
  end loop;

  for seed in select value from jsonb_array_elements(case_seed)
  loop
    insert into public.pages (
      slug, route_path, title, seo_title, seo_description, status, published_at, page_kind, is_system
    ) values (
      seed ->> 'slug',
      seed ->> 'path',
      seed ->> 'title',
      (seed ->> 'title') || ' — кейс ThePeak',
      seed ->> 'description',
      'published',
      now(),
      'case',
      true
    )
    on conflict (slug) do update set
      route_path = excluded.route_path,
      page_kind = 'case',
      is_system = true
    returning id into seeded_page_id;

    if not exists (select 1 from public.page_blocks where page_id = seeded_page_id) then
      insert into public.page_blocks (page_id, block_id, sort_order, content)
      select seeded_page_id, id, 0, seed - 'slug' - 'path'
      from public.blocks
      where type = 'case_page';
    end if;
  end loop;
end;
$$;

create or replace function public.cms_create_page(p_title text, p_slug text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_page_id uuid;
begin
  if not public.is_cms_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if char_length(trim(p_title)) not between 1 and 160
     or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or p_slug in ('admin', 'api', 'cases', 'gallery', 'privacy', 'services', 'site-development', 'team', 'web') then
    raise exception 'Invalid page title or slug' using errcode = '22023';
  end if;

  insert into public.pages (title, slug, route_path, page_kind, is_system)
  values (trim(p_title), p_slug, '/' || p_slug, 'builder', false)
  returning id into new_page_id;

  insert into public.page_blocks (page_id, block_id, sort_order, content)
  select new_page_id, id, row_number() over (order by template_order) - 1, default_content
  from (
    select id, default_content,
      case type when 'hero' then 0 when 'text' then 1 when 'cta' then 2 else 99 end as template_order
    from public.blocks
    where type in ('hero', 'text', 'cta')
      and is_active
      and 'builder' = any(page_kinds)
  ) templates
  order by template_order;

  return new_page_id;
end;
$$;

create or replace function public.cms_save_page(
  p_page_id uuid,
  p_title text,
  p_slug text,
  p_status text,
  p_seo_title text,
  p_seo_description text,
  p_blocks jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_page_kind text;
  current_is_system boolean;
begin
  if not public.is_cms_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  select page_kind, is_system
  into current_page_kind, current_is_system
  from public.pages
  where id = p_page_id;

  if not found then
    raise exception 'Page not found' using errcode = 'P0002';
  end if;

  if char_length(trim(p_title)) not between 1 and 160
     or p_slug !~ '^[a-z0-9]+([-/][a-z0-9]+)*$'
     or p_status not in ('draft', 'published')
     or char_length(p_seo_title) > 160
     or char_length(p_seo_description) > 320
     or jsonb_typeof(p_blocks) <> 'array'
     or jsonb_array_length(p_blocks) > 50
     or pg_column_size(p_blocks) > 524288 then
    raise exception 'Invalid page data' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_blocks) as item(id uuid, block_id uuid, sort_order integer, content jsonb, is_visible boolean)
    left join public.blocks on blocks.id = item.block_id and blocks.is_active
    where item.id is null
       or item.block_id is null
       or item.sort_order is null
       or item.sort_order < 0
       or jsonb_typeof(item.content) <> 'object'
       or blocks.id is null
       or not (current_page_kind = any(blocks.page_kinds))
  ) then
    raise exception 'Invalid page block data' using errcode = '22023';
  end if;

  update public.pages
  set title = trim(p_title),
      slug = case when current_is_system then slug else p_slug end,
      route_path = case when current_is_system then route_path else '/' || p_slug end,
      status = case when current_is_system then 'published' else p_status end,
      seo_title = p_seo_title,
      seo_description = p_seo_description,
      published_at = case
        when current_is_system or p_status = 'published' then coalesce(published_at, now())
        else null
      end
  where id = p_page_id;

  delete from public.page_blocks where page_id = p_page_id;

  insert into public.page_blocks (id, page_id, block_id, sort_order, content, is_visible)
  select item.id, p_page_id, item.block_id, item.sort_order, item.content, coalesce(item.is_visible, true)
  from jsonb_to_recordset(p_blocks) as item(id uuid, block_id uuid, sort_order integer, content jsonb, is_visible boolean)
  order by item.sort_order;
end;
$$;

revoke all on function public.cms_create_page(text, text) from public, anon;
revoke all on function public.cms_save_page(uuid, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.cms_create_page(text, text) to authenticated;
grant execute on function public.cms_save_page(uuid, text, text, text, text, text, jsonb) to authenticated;
