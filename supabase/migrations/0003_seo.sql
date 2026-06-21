create table if not exists public.seo (
  page       text primary key,
  data       jsonb not null,            -- { title, description, keywords, og:{title,description,image} }
  updated_at timestamptz not null default now()
);
alter table public.seo enable row level security;
drop policy if exists seo_read on public.seo;
create policy seo_read on public.seo for select using (true);
-- aucune policy d'écriture : l'écriture se fera au point de réception (Sprint 3),
-- côté serveur, via la clé service.
