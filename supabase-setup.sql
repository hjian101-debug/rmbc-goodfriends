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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read site media" on storage.objects;
drop policy if exists "Admin can upload site media" on storage.objects;
drop policy if exists "Admin can update site media" on storage.objects;
drop policy if exists "Admin can delete site media" on storage.objects;

create policy "Public can read site media"
on storage.objects
for select
using (bucket_id = 'site-media');

create policy "Admin can upload site media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and ((auth.jwt() ->> 'email') = 'gff@rmbc.local')
);

create policy "Admin can update site media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and ((auth.jwt() ->> 'email') = 'gff@rmbc.local')
)
with check (
  bucket_id = 'site-media'
  and ((auth.jwt() ->> 'email') = 'gff@rmbc.local')
);

create policy "Admin can delete site media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and ((auth.jwt() ->> 'email') = 'gff@rmbc.local')
);
