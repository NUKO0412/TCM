-- ============================================================================
-- TCM Agencement — schéma initial (Lot 2)
-- À coller dans Supabase → SQL Editor → Run, sur un projet NEUF et vierge.
-- Idempotent : peut être ré-exécuté sans casser (IF NOT EXISTS / OR REPLACE).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Profils & rôles
--    Un profil par compte. admin (Théo) et super_admin (toi) ont des droits
--    STRICTEMENT identiques : le rôle n'est qu'une étiquette.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null check (role in ('admin', 'super_admin')),
  display_name text,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2) Contenu — singletons (une ligne par section)
--    data jsonb reprend EXACTEMENT la forme des interfaces de app/src/data/types.ts
-- ----------------------------------------------------------------------------
create table if not exists public.content_sections (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3) Contenu — listes réordonnables (cartes, étapes, réalisations, villes…)
-- ----------------------------------------------------------------------------
create table if not exists public.content_items (
  id         uuid primary key default gen_random_uuid(),
  collection text not null,
  ord        integer not null,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists content_items_collection_ord_idx
  on public.content_items (collection, ord);

-- ----------------------------------------------------------------------------
-- 4) Helper : l'utilisateur courant est-il éditeur ?
--    (admin ou super_admin — droits identiques). Utilisé par la RLS.
-- ----------------------------------------------------------------------------
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

-- ----------------------------------------------------------------------------
-- 5) Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.content_sections enable row level security;
alter table public.content_items    enable row level security;

-- Profils : chacun lit uniquement son propre profil (donc son rôle).
-- Aucune écriture publique : les profils sont gérés par le script (clé service).
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using (id = auth.uid());

-- Contenu : lecture PUBLIQUE (le site doit lire en anonyme).
drop policy if exists content_sections_read on public.content_sections;
create policy content_sections_read
  on public.content_sections for select
  using (true);

drop policy if exists content_items_read on public.content_items;
create policy content_items_read
  on public.content_items for select
  using (true);

-- Contenu : écriture réservée aux éditeurs connectés (prêt pour le Lot 4,
-- non exercé maintenant). Une politique "for all" couvre insert/update/delete.
drop policy if exists content_sections_write on public.content_sections;
create policy content_sections_write
  on public.content_sections for all
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists content_items_write on public.content_items;
create policy content_items_write
  on public.content_items for all
  using (public.is_editor())
  with check (public.is_editor());
