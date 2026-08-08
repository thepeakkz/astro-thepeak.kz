create extension if not exists pgcrypto;

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and slug not in ('admin', 'api', 'cases', 'gallery', 'privacy', 'services', 'site-development', 'team', 'web')
  ),
  title text not null check (char_length(title) between 1 and 160),
  seo_title text not null default '' check (char_length(seo_title) <= 160),
  seo_description text not null default '' check (char_length(seo_description) <= 320),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  type text not null unique check (type ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  description text not null default '',
  fields jsonb not null default '[]'::jsonb check (jsonb_typeof(fields) = 'array'),
  default_content jsonb not null default '{}'::jsonb check (jsonb_typeof(default_content) = 'object'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  block_id uuid not null references public.blocks(id) on delete restrict,
  sort_order integer not null check (sort_order >= 0),
  content jsonb not null default '{}'::jsonb check (
    jsonb_typeof(content) = 'object'
    and pg_column_size(content) <= 131072
  ),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, sort_order)
);

create index if not exists pages_status_slug_idx on public.pages(status, slug);
create index if not exists page_blocks_page_order_idx on public.page_blocks(page_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pages_set_updated_at on public.pages;
create trigger pages_set_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists blocks_set_updated_at on public.blocks;
create trigger blocks_set_updated_at
before update on public.blocks
for each row execute function public.set_updated_at();

drop trigger if exists page_blocks_set_updated_at on public.page_blocks;
create trigger page_blocks_set_updated_at
before update on public.page_blocks
for each row execute function public.set_updated_at();

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.pages enable row level security;
alter table public.blocks enable row level security;
alter table public.page_blocks enable row level security;

drop policy if exists "Published pages are public" on public.pages;
create policy "Published pages are public"
on public.pages for select
to anon, authenticated
using (status = 'published' or public.is_cms_admin());

drop policy if exists "Admins manage pages" on public.pages;
create policy "Admins manage pages"
on public.pages for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "Active block templates are public" on public.blocks;
create policy "Active block templates are public"
on public.blocks for select
to anon, authenticated
using (is_active or public.is_cms_admin());

drop policy if exists "Admins manage block templates" on public.blocks;
create policy "Admins manage block templates"
on public.blocks for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "Published visible page blocks are public" on public.page_blocks;
create policy "Published visible page blocks are public"
on public.page_blocks for select
to anon, authenticated
using (
  public.is_cms_admin()
  or (
    is_visible
    and exists (
      select 1
      from public.pages
      where pages.id = page_blocks.page_id
        and pages.status = 'published'
    )
  )
);

drop policy if exists "Admins manage page blocks" on public.page_blocks;
create policy "Admins manage page blocks"
on public.page_blocks for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

insert into public.blocks (type, name, description, fields, default_content)
values
  (
    'hero',
    'Первый экран',
    'Крупный заголовок, описание, фон и кнопка.',
    '[
      {"name":"eyebrow","label":"Надпись над заголовком","type":"text"},
      {"name":"title","label":"Заголовок","type":"text","required":true},
      {"name":"description","label":"Описание","type":"textarea"},
      {"name":"backgroundUrl","label":"Фоновое изображение","type":"media","accept":"image/*"},
      {"name":"buttonLabel","label":"Текст кнопки","type":"text"},
      {"name":"buttonUrl","label":"Ссылка кнопки","type":"url"}
    ]'::jsonb,
    '{"eyebrow":"","title":"Заголовок страницы","description":"Коротко расскажите, чем полезна эта страница.","backgroundUrl":"","buttonLabel":"Связаться","buttonUrl":"/#contacts"}'::jsonb
  ),
  (
    'text',
    'Текстовый блок',
    'Заголовок и обычный многострочный текст.',
    '[
      {"name":"heading","label":"Заголовок","type":"text"},
      {"name":"body","label":"Текст","type":"textarea","required":true},
      {"name":"align","label":"Выравнивание","type":"select","options":[{"label":"Слева","value":"left"},{"label":"По центру","value":"center"}]}
    ]'::jsonb,
    '{"heading":"О проекте","body":"Добавьте сюда основной текст.","align":"left"}'::jsonb
  ),
  (
    'media',
    'Фото или видео',
    'Один медиафайл с подписью.',
    '[
      {"name":"mediaType","label":"Тип файла","type":"select","options":[{"label":"Изображение","value":"image"},{"label":"Видео","value":"video"}]},
      {"name":"mediaUrl","label":"Фото или видео","type":"media","accept":"image/*,video/*","mediaTypeField":"mediaType","required":true},
      {"name":"alt","label":"Описание для доступности","type":"text"},
      {"name":"caption","label":"Подпись","type":"text"}
    ]'::jsonb,
    '{"mediaType":"image","mediaUrl":"","alt":"","caption":""}'::jsonb
  ),
  (
    'cta',
    'Призыв к действию',
    'Финальный блок с текстом и кнопкой.',
    '[
      {"name":"title","label":"Заголовок","type":"text","required":true},
      {"name":"description","label":"Описание","type":"textarea"},
      {"name":"buttonLabel","label":"Текст кнопки","type":"text","required":true},
      {"name":"buttonUrl","label":"Ссылка кнопки","type":"url","required":true}
    ]'::jsonb,
    '{"title":"Обсудим ваш проект?","description":"Расскажите о задаче — мы предложим следующий шаг.","buttonLabel":"Связаться","buttonUrl":"/#contacts"}'::jsonb
  )
on conflict (type) do update set
  name = excluded.name,
  description = excluded.description,
  fields = excluded.fields,
  default_content = excluded.default_content,
  is_active = true;

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
     or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid page title or slug' using errcode = '22023';
  end if;

  insert into public.pages (title, slug)
  values (trim(p_title), p_slug)
  returning id into new_page_id;

  insert into public.page_blocks (page_id, block_id, sort_order, content)
  select new_page_id, id, row_number() over (order by template_order) - 1, default_content
  from (
    select id, default_content,
      case type when 'hero' then 0 when 'text' then 1 when 'cta' then 2 else 99 end as template_order
    from public.blocks
    where type in ('hero', 'text', 'cta') and is_active
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
begin
  if not public.is_cms_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if char_length(trim(p_title)) not between 1 and 160
     or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
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
  ) then
    raise exception 'Invalid page block data' using errcode = '22023';
  end if;

  update public.pages
  set title = trim(p_title),
      slug = p_slug,
      status = p_status,
      seo_title = p_seo_title,
      seo_description = p_seo_description,
      published_at = case
        when p_status = 'published' then coalesce(published_at, now())
        else null
      end
  where id = p_page_id;

  if not found then
    raise exception 'Page not found' using errcode = 'P0002';
  end if;

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

grant select on public.pages, public.blocks, public.page_blocks to anon, authenticated;
grant insert, update, delete on public.pages, public.blocks, public.page_blocks to authenticated;
