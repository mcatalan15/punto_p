-- Punto P — initial schema + row level security.
-- This migration is the single source of truth for the database.
-- It runs automatically on `supabase start` / `supabase db reset` (local)
-- and on `supabase db push` (production).

-- Menu categories (Pizzas rojas, Bebidas, etc.)
create table if not exists categories (
  id         bigint generated always as identity primary key,
  name       text not null,
  position   int  not null default 0
);

-- Menu items
create table if not exists menu_items (
  id          bigint generated always as identity primary key,
  category_id bigint references categories(id) on delete cascade,
  name        text not null,
  ingredients text,
  price       numeric(6,2) not null default 0,
  position    int not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Row level security
alter table categories enable row level security;
alter table menu_items enable row level security;

-- PUBLIC (anon) may READ the menu; only visible items.
create policy "public reads categories"
  on categories for select to anon using (true);

create policy "public reads visible items"
  on menu_items for select to anon using (visible = true);

-- LOGGED-IN admins may do everything.
create policy "admins manage categories"
  on categories for all to authenticated using (true) with check (true);

create policy "admins manage items"
  on menu_items for all to authenticated using (true) with check (true);
