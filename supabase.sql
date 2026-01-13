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
