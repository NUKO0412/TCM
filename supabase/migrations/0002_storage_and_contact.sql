-- ============================================================================
-- TCM Agencement — Lots 4 & 5
--   - Storage : bucket public `site-media` (photos éditables)
--   - Table `contact_requests` (demandes du formulaire) + RLS
-- Idempotent. À appliquer via : npm run db:apply -- supabase/migrations/0002_storage_and_contact.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Bucket de stockage des images du site
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

-- Lecture publique des objets du bucket (en plus de l'URL publique).
drop policy if exists site_media_read on storage.objects;
create policy site_media_read
  on storage.objects for select
  using (bucket_id = 'site-media');

-- Écriture (upload / maj / suppression) réservée aux éditeurs connectés.
drop policy if exists site_media_write on storage.objects;
create policy site_media_write
  on storage.objects for all
  using (bucket_id = 'site-media' and public.is_editor())
  with check (bucket_id = 'site-media' and public.is_editor());

-- ----------------------------------------------------------------------------
-- 2) Demandes du formulaire de contact
-- ----------------------------------------------------------------------------
create table if not exists public.contact_requests (
  id          uuid primary key default gen_random_uuid(),
  nom         text,
  prenom      text,
  email       text,
  telephone   text,
  ville       text,
  type_projet text,
  message     text,
  is_read     boolean not null default false,
  notified    boolean not null default false, -- email réel câblé au déploiement
  created_at  timestamptz not null default now()
);

create index if not exists contact_requests_created_idx
  on public.contact_requests (created_at desc);

alter table public.contact_requests enable row level security;

-- Envoi public : un visiteur anonyme peut déposer une demande.
drop policy if exists contact_requests_insert_public on public.contact_requests;
create policy contact_requests_insert_public
  on public.contact_requests for insert
  with check (true);

-- Lecture / gestion : réservées aux éditeurs (boîte de réception du back-office).
drop policy if exists contact_requests_read on public.contact_requests;
create policy contact_requests_read
  on public.contact_requests for select
  using (public.is_editor());

drop policy if exists contact_requests_update on public.contact_requests;
create policy contact_requests_update
  on public.contact_requests for update
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists contact_requests_delete on public.contact_requests;
create policy contact_requests_delete
  on public.contact_requests for delete
  using (public.is_editor());
