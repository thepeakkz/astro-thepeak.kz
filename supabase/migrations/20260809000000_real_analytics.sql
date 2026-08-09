-- First-party analytics for the CMS dashboard.
-- Events contain anonymous UUIDs only; IP addresses are never stored.

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_id uuid not null unique,
  visitor_id uuid not null,
  session_id uuid not null,
  event_name text not null check (event_name in ('page_view', 'section_view', 'cta_click', 'scroll_depth')),
  page_path text not null check (char_length(page_path) between 1 and 500),
  page_title text not null default '' check (char_length(page_title) <= 300),
  source text not null default 'Прямой заход' check (char_length(source) <= 300),
  medium text not null default '' check (char_length(medium) <= 300),
  campaign text not null default '' check (char_length(campaign) <= 300),
  device_type text not null check (device_type in ('Компьютер', 'Мобильный', 'Планшет')),
  city text not null default '' check (char_length(city) <= 160),
  country text not null default '' check (char_length(country) <= 160),
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object'
    and pg_column_size(metadata) <= 4096
  ),
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events(occurred_at desc);
create index if not exists analytics_events_name_occurred_idx
  on public.analytics_events(event_name, occurred_at desc);
create index if not exists analytics_events_visitor_idx
  on public.analytics_events(visitor_id, occurred_at desc);
create index if not exists analytics_events_page_idx
  on public.analytics_events(page_path, occurred_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists "Visitors submit analytics events" on public.analytics_events;
create policy "Visitors submit analytics events"
on public.analytics_events for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins read analytics events" on public.analytics_events;
create policy "Admins read analytics events"
on public.analytics_events for select
to authenticated
using (public.is_cms_admin());

grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant usage, select on sequence public.analytics_events_id_seq to anon, authenticated;

alter table public.leads
  add column if not exists visitor_id uuid,
  add column if not exists session_id uuid;

create index if not exists leads_visitor_created_idx
  on public.leads(visitor_id, created_at desc);

create or replace function public.cms_analytics_report(p_start date, p_end date)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not public.is_cms_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if p_start is null or p_end is null or p_end < p_start or p_end - p_start > 3660 then
    raise exception 'Invalid analytics period' using errcode = '22023';
  end if;

  with filtered_events as (
    select *
    from public.analytics_events
    where (occurred_at at time zone 'Asia/Qostanay')::date between p_start and p_end
  ),
  filtered_leads as (
    select *
    from public.leads
    where status <> 'junk'
      and (created_at at time zone 'Asia/Qostanay')::date between p_start and p_end
  ),
  totals as (
    select
      count(distinct visitor_id) filter (where event_name = 'page_view')::integer as visitors,
      count(*) filter (where event_name = 'page_view')::integer as pageviews
    from filtered_events
  ),
  lead_total as (
    select count(*)::integer as leads from filtered_leads
  ),
  days as (
    select generate_series(p_start, p_end, interval '1 day')::date as day
  ),
  daily as (
    select
      days.day,
      count(distinct filtered_events.visitor_id) filter (where filtered_events.event_name = 'page_view')::integer as visitors,
      count(filtered_events.id) filter (where filtered_events.event_name = 'page_view')::integer as pageviews
    from days
    left join filtered_events
      on (filtered_events.occurred_at at time zone 'Asia/Qostanay')::date = days.day
    group by days.day
    order by days.day
  ),
  pages as (
    select
      page_path,
      coalesce(nullif(max(page_title), ''), page_path) as title,
      count(*)::integer as views
    from filtered_events
    where event_name = 'page_view'
    group by page_path
    order by count(*) desc, page_path
    limit 10
  ),
  device_rows as (
    select
      device.device_type,
      count(distinct event.visitor_id)::integer as visitors,
      count(event.id)::integer as pageviews
    from (values ('Компьютер'), ('Мобильный'), ('Планшет')) as device(device_type)
    left join filtered_events event
      on event.event_name = 'page_view' and event.device_type = device.device_type
    group by device.device_type
  ),
  lead_devices as (
    select
      coalesce(nullif(attribution ->> 'deviceType', ''), 'Не определено') as device_type,
      count(*)::integer as leads
    from filtered_leads
    group by 1
  ),
  campaign_visits as (
    select source, medium, campaign, count(distinct session_id)::integer as visits
    from filtered_events
    where event_name = 'page_view'
      and (campaign <> '' or medium <> '' or source <> 'Прямой заход')
    group by source, medium, campaign
  ),
  campaign_leads as (
    select
      coalesce(nullif(attribution #>> '{lastTouch,source}', ''), nullif(attribution #>> '{firstTouch,source}', ''), 'Прямой заход') as source,
      coalesce(attribution #>> '{lastTouch,params,utm_medium}', attribution #>> '{firstTouch,params,utm_medium}', '') as medium,
      coalesce(attribution #>> '{lastTouch,params,utm_campaign}', attribution #>> '{firstTouch,params,utm_campaign}', '') as campaign,
      count(*)::integer as leads
    from filtered_leads
    group by 1, 2, 3
  ),
  campaigns as (
    select
      coalesce(visits.source, leads.source) as source,
      coalesce(visits.medium, leads.medium, '') as medium,
      coalesce(visits.campaign, leads.campaign, '') as campaign,
      coalesce(visits.visits, 0)::integer as visits,
      coalesce(leads.leads, 0)::integer as leads
    from campaign_visits visits
    full join campaign_leads leads using (source, medium, campaign)
    order by coalesce(leads.leads, 0) desc, coalesce(visits.visits, 0) desc
    limit 20
  ),
  funnel as (
    select
      count(distinct visitor_id) filter (where event_name = 'page_view')::integer as visits,
      count(distinct visitor_id) filter (where event_name = 'section_view')::integer as sections,
      count(distinct visitor_id) filter (where event_name = 'cta_click')::integer as cta_clicks
    from filtered_events
  ),
  scroll_rows as (
    select
      threshold,
      count(distinct visitor_id)::integer as visitors
    from (
      select visitor_id, nullif(metadata ->> 'threshold', '')::integer as threshold
      from filtered_events
      where event_name = 'scroll_depth'
    ) scroll_events
    where threshold in (25, 50, 75, 100)
    group by threshold
  ),
  case_views as (
    select
      page_path,
      coalesce(nullif(max(page_title), ''), page_path) as title,
      count(distinct visitor_id)::integer as visitors
    from filtered_events
    where event_name = 'page_view' and page_path like '/cases/%'
    group by page_path
  ),
  case_leads as (
    select event.page_path, count(distinct lead.id)::integer as leads
    from filtered_events event
    join filtered_leads lead on lead.visitor_id = event.visitor_id
    where event.event_name = 'page_view' and event.page_path like '/cases/%'
    group by event.page_path
  ),
  cases as (
    select view.page_path, view.title, view.visitors, coalesce(lead.leads, 0)::integer as leads
    from case_views view
    left join case_leads lead using (page_path)
    order by coalesce(lead.leads, 0) desc, view.visitors desc
    limit 10
  ),
  sources as (
    select source, count(distinct session_id)::integer as visits
    from filtered_events
    where event_name = 'page_view'
    group by source
    order by count(distinct session_id) desc
  ),
  locations as (
    select
      coalesce(nullif(city, ''), nullif(country, ''), 'Не определено') as location,
      count(distinct visitor_id)::integer as visitors
    from filtered_events
    where event_name = 'page_view'
    group by 1
    order by count(distinct visitor_id) desc
    limit 10
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'uniqueVisitors', totals.visitors,
      'pageviews', totals.pageviews,
      'leadsCount', lead_total.leads
    ),
    'dailyData', coalesce((select jsonb_agg(jsonb_build_object(
      'date', to_char(day, 'DD.MM'), 'visitors', visitors, 'pageviews', pageviews
    ) order by day) from daily), '[]'::jsonb),
    'topPages', coalesce((select jsonb_agg(jsonb_build_object(
      'path', page_path, 'title', title, 'views', views
    )) from pages), '[]'::jsonb),
    'deviceRows', coalesce((select jsonb_agg(jsonb_build_object(
      'deviceType', device.device_type,
      'visitors', device.visitors,
      'pageviews', device.pageviews,
      'leads', coalesce(leads.leads, 0)
    )) from device_rows device left join lead_devices leads using (device_type)), '[]'::jsonb),
    'campaigns', coalesce((select jsonb_agg(to_jsonb(campaigns)) from campaigns), '[]'::jsonb),
    'funnel', (select to_jsonb(funnel) from funnel),
    'scrollRows', coalesce((select jsonb_agg(to_jsonb(scroll_rows)) from scroll_rows), '[]'::jsonb),
    'cases', coalesce((select jsonb_agg(to_jsonb(cases)) from cases), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(to_jsonb(sources)) from sources), '[]'::jsonb),
    'locations', coalesce((select jsonb_agg(to_jsonb(locations)) from locations), '[]'::jsonb),
    'collectionStartedAt', (select min(occurred_at) from public.analytics_events)
  ) into result
  from totals cross join lead_total;

  return result;
end;
$$;

revoke all on function public.cms_analytics_report(date, date) from public, anon;
grant execute on function public.cms_analytics_report(date, date) to authenticated;
