-- Execute este script no SQL Editor do Supabase.
-- Ele cria as tabelas principais para clientes, produtos, vendas e itens de venda.

create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  nome text not null default 'Cliente',
  email text not null unique,
  telefone text,
  cpf text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  nome text not null,
  preco_cents integer not null default 0,
  tipo text not null default 'digital',
  imagem_url text,
  material_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  mp_payment_id text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'pending',
  payment_method text not null default 'pix',
  total_amount numeric(10, 2) not null default 0,
  currency text not null default 'BRL',
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price_cents integer not null default 0,
  line_total_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
before update on public.customers
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute procedure public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "admin read customers" on public.customers;
create policy "admin read customers" on public.customers
for select using (public.is_admin());

drop policy if exists "admin write customers" on public.customers;
create policy "admin write customers" on public.customers
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read products" on public.products;
create policy "admin read products" on public.products
for select using (public.is_admin());

drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders
for select using (public.is_admin());

drop policy if exists "admin write orders" on public.orders;
create policy "admin write orders" on public.orders
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read order items" on public.order_items;
create policy "admin read order items" on public.order_items
for select using (public.is_admin());

drop policy if exists "admin write order items" on public.order_items;
create policy "admin write order items" on public.order_items
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read admin users" on public.admin_users;
create policy "admin read admin users" on public.admin_users
for select using (public.is_admin());

-- Importante:
-- 1) Crie um usuário em Authentication > Users.
-- 2) Pegue o UUID dele e rode:
--    insert into public.admin_users (user_id) values ('UUID_DO_USUARIO');
-- 3) Crie um bucket chamado "materiais" (privado) no Storage
--    ou execute:
--    insert into storage.buckets (id, name, public) values ('materiais', 'materiais', false);
-- 4) Policies para upload/listagem de admins no bucket materiais:

drop policy if exists "admin read materiais objects" on storage.objects;
create policy "admin read materiais objects" on storage.objects
for select using (
  bucket_id = 'materiais' and public.is_admin()
);

drop policy if exists "admin write materiais objects" on storage.objects;
create policy "admin write materiais objects" on storage.objects
for all using (
  bucket_id = 'materiais' and public.is_admin()
) with check (
  bucket_id = 'materiais' and public.is_admin()
);
