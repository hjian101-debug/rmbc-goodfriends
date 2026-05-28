create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.site_content to anon;
grant select, insert, update, delete on public.site_content to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_content'
      and policyname = 'Public can read site content'
  ) then
    create policy "Public can read site content"
    on public.site_content
    for select
    using (true);
  end if;

  drop policy if exists "Logged in admins can write site content" on public.site_content;

  create policy "Logged in admins can write site content"
  on public.site_content
  for all
  using ((auth.jwt() ->> 'email') = 'gff@rmbc.local')
  with check ((auth.jwt() ->> 'email') = 'gff@rmbc.local');
end $$;
