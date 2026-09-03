-- Создаем сервисную таблицу
create table if not exists public.keep_alive (
  id text primary key default 'heartbeat',
  updated_at timestamptz default now()
);

-- Включаем RLS и доступ для обновления
alter table public.keep_alive enable row level security;

create policy "Allow anon keep_alive upsert"
  on public.keep_alive
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Создаем начальную запись
insert into public.keep_alive (id, updated_at)
values ('heartbeat', now())
on conflict (id) do update set updated_at = now();
