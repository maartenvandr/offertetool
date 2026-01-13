# Offertetool Web (Next.js + Supabase)

Dit project is jouw online offertetool (intern) met:
- Login
- Nieuwe klant + materialen toevoegen
- Klantlijst
- Klantdetails: materialen + besteld-status + installatiedatum per klant
- Artikelenbeheer (artikellijst) + prijs automatisch invullen bij nieuwe klant

## 1) Supabase aanmaken
1. Maak een nieuw Supabase project aan.
2. Ga naar **SQL Editor** en run `supabase.sql` (zie hieronder in deze README).
3. Ga naar **Authentication → Users** en maak jouw account aan (email/wachtwoord).
4. Ga naar **Project Settings → API** en kopieer:
   - Project URL
   - anon public key

## 2) Environment variables
Maak `.env.local` aan in de root (kopieer van `.env.local.example`) en vul in:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## 3) Start lokaal
```bash
npm install
npm run dev
```
Open http://localhost:3000

## 4) Artikelen importeren vanuit Excel
- Exporteer je artikellijst naar CSV met kolommen: `name,unit_price`
- Supabase → Table Editor → items → Import data

## 5) Online zetten op Vercel
1. Zet dit project op GitHub (of upload via Vercel).
2. Vercel → New Project → import repo
3. Voeg env vars toe in Vercel (zelfde als `.env.local`)
4. Deploy

## supabase.sql (plak in Supabase SQL Editor)
```sql
-- Customers
create table if not exists public.customers (
  id bigserial primary key,
  name text not null,
  email text,
  phone text,
  address text,
  install_date date,
  created_at timestamptz not null default now()
);

-- Materials
create table if not exists public.materials (
  id bigserial primary key,
  customer_id bigint not null references public.customers(id) on delete cascade,
  item text not null,
  qty numeric not null default 1,
  unit_price numeric not null default 0,
  ordered boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_materials_customer_id on public.materials(customer_id);

-- Items (artikellijst)
create table if not exists public.items (
  id bigserial primary key,
  name text not null unique,
  unit_price numeric not null default 0,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.customers enable row level security;
alter table public.materials enable row level security;
alter table public.items enable row level security;

drop policy if exists customers_auth_all on public.customers;
drop policy if exists materials_auth_all on public.materials;
drop policy if exists items_auth_all on public.items;

create policy "customers_auth_all"
on public.customers
for all
to authenticated
using (true)
with check (true);

create policy "materials_auth_all"
on public.materials
for all
to authenticated
using (true)
with check (true);

create policy "items_auth_all"
on public.items
for all
to authenticated
using (true)
with check (true);
```
