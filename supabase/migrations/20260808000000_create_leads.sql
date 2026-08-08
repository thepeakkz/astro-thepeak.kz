-- Create leads table for website form submissions
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  phone text not null check (char_length(trim(phone)) > 0),
  source text not null default 'Не указан',
  comment text not null default 'Не указан',
  contact_method text not null default 'Не указан',
  status text not null default 'new' check (status in ('new', 'in_progress', 'contacted', 'closed', 'junk')),
  attribution jsonb not null default '{}'::jsonb check (jsonb_typeof(attribution) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for performance
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_status_idx on public.leads(status);

-- Auto-update updated_at timestamp
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.leads enable row level security;

-- Allow anonymous and authenticated visitors to submit leads
drop policy if exists "Anyone can insert leads" on public.leads;
create policy "Anyone can insert leads"
on public.leads for insert
to anon, authenticated
with check (true);

-- Allow CMS admins full management access (select, update, delete)
drop policy if exists "Admins manage leads" on public.leads;
create policy "Admins manage leads"
on public.leads for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

-- Grants
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
