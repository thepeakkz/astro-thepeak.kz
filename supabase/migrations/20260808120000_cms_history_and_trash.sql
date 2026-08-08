-- Migration for CMS Trash Bin (Soft Delete) and Revision History

-- 1. Add deleted_at to pages
alter table public.pages
  add column if not exists deleted_at timestamptz default null;

create index if not exists pages_deleted_at_idx on public.pages(deleted_at);

-- 2. Create page_revisions table
create table if not exists public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  title text not null,
  slug text not null,
  status text not null,
  seo_title text not null default '',
  seo_description text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists page_revisions_page_created_idx on public.page_revisions(page_id, created_at desc);

alter table public.page_revisions enable row level security;

drop policy if exists "Admins manage page revisions" on public.page_revisions;
create policy "Admins manage page revisions"
on public.page_revisions for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

grant select, insert, delete on public.page_revisions to authenticated;

-- 3. Update public pages policy to exclude soft-deleted pages
drop policy if exists "Published pages are public" on public.pages;
create policy "Published pages are public"
on public.pages for select
to anon, authenticated
using ((status = 'published' and deleted_at is null) or public.is_cms_admin());

-- 4. Soft delete, Restore, Permanent delete RPC functions
create or replace function public.cms_soft_delete_page(p_page_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_cms_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  update public.pages
  set deleted_at = now()
  where id = p_page_id and is_system = false;

  if not found then
    raise exception 'Page not found or is a system page' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.cms_restore_page(p_page_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_cms_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  update public.pages
  set deleted_at = null
  where id = p_page_id;

  if not found then
    raise exception 'Page not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.cms_permanent_delete_page(p_page_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_cms_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  delete from public.pages
  where id = p_page_id and deleted_at is not null and is_system = false;

  if not found then
    raise exception 'Page not found in trash or is a system page' using errcode = 'P0002';
  end if;
end;
$$;

-- 5. Updated cms_save_page with revision snapshots and 30-version limit
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
     or p_slug !~ '^[a-z0-9]+(?:[-/][a-z0-9]+)*$'
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

  -- Create snapshot before updating
  insert into public.page_revisions (page_id, title, slug, status, seo_title, seo_description, blocks)
  values (p_page_id, trim(p_title), p_slug, p_status, p_seo_title, p_seo_description, p_blocks);

  -- Keep max 30 latest revisions per page
  delete from public.page_revisions
  where id in (
    select id from public.page_revisions
    where page_id = p_page_id
    order by created_at desc
    offset 30
  );

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
  where id = p_page_id and deleted_at is null;

  if not found then
    raise exception 'Page not found or is in trash' using errcode = 'P0002';
  end if;

  delete from public.page_blocks where page_id = p_page_id;

  insert into public.page_blocks (id, page_id, block_id, sort_order, content, is_visible)
  select item.id, p_page_id, item.block_id, item.sort_order, item.content, coalesce(item.is_visible, true)
  from jsonb_to_recordset(p_blocks) as item(id uuid, block_id uuid, sort_order integer, content jsonb, is_visible boolean)
  order by item.sort_order;
end;
$$;

-- Permissions for RPCs
revoke all on function public.cms_soft_delete_page(uuid) from public, anon;
revoke all on function public.cms_restore_page(uuid) from public, anon;
revoke all on function public.cms_permanent_delete_page(uuid) from public, anon;

grant execute on function public.cms_soft_delete_page(uuid) to authenticated;
grant execute on function public.cms_restore_page(uuid) to authenticated;
grant execute on function public.cms_permanent_delete_page(uuid) to authenticated;
