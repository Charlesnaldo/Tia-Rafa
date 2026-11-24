-- Execute no SQL Editor do Supabase (pode rodar mais de uma vez).
-- Cria kits, cupons, leads, acompanhamento de Pix e campos de envio dos pedidos.
-- O site funciona antes desta migração: os recursos novos ficam inativos até as tabelas existirem.

-- ---------------------------------------------------------------------------
-- Kits: um produto que entrega os materiais de outros produtos.
-- ---------------------------------------------------------------------------
create table if not exists public.kit_items (
  kit_id text not null references public.products(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (kit_id, product_id),
  check (kit_id <> product_id)
);
create index if not exists idx_kit_items_product_id on public.kit_items(product_id);

-- ---------------------------------------------------------------------------
-- Cupons de desconto (percentual OU valor fixo).
-- ---------------------------------------------------------------------------
create table if not exists public.coupons (
  code text primary key check (code ~ '^[A-Z0-9_-]{3,32}$'),
  description text,
  percent_off integer check (percent_off between 1 and 90),
  amount_off_cents integer check (amount_off_cents > 0),
  min_items integer not null default 1 check (min_items >= 1),
  min_subtotal_cents integer not null default 0 check (min_subtotal_cents >= 0),
  max_uses integer check (max_uses > 0),
  uses integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((percent_off is null) <> (amount_off_cents is null))
);

drop trigger if exists trg_coupons_updated_at on public.coupons;
create trigger trg_coupons_updated_at
before update on public.coupons
for each row execute procedure public.touch_updated_at();

-- Um resgate por pagamento: reprocessar o webhook não conta o uso duas vezes.
create table if not exists public.coupon_redemptions (
  payment_id text primary key,
  code text not null references public.coupons(code) on delete cascade,
  discount_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.redeem_coupon(p_code text, p_payment_id text, p_discount_cents integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.coupon_redemptions (payment_id, code, discount_cents)
  values (p_payment_id, p_code, p_discount_cents)
  on conflict (payment_id) do nothing;
  if not found then
    return false;
  end if;
  update public.coupons set uses = uses + 1 where code = p_code;
  return true;
end;
$$;
revoke all on function public.redeem_coupon(text, text, integer) from public, anon, authenticated;
grant execute on function public.redeem_coupon(text, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Leads: quem baixou material gratuito.
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nome text,
  telefone text,
  source text not null default 'atividades',
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute procedure public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Pagamentos iniciados: base do funil "Pix gerado x pago" e do lembrete.
-- ---------------------------------------------------------------------------
create table if not exists public.pending_payments (
  mp_payment_id text primary key,
  email text not null,
  nome text,
  telefone text,
  payment_method text not null default 'pix',
  total_amount numeric(10, 2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  coupon_code text,
  status text not null default 'pending',
  reminder_sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_pending_payments_created_at on public.pending_payments(created_at desc);

-- ---------------------------------------------------------------------------
-- Pedidos: cupom, envio de itens físicos e e-mail pós-venda.
-- ---------------------------------------------------------------------------
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_cents integer not null default 0;
alter table public.orders add column if not exists fulfillment_status text
  check (fulfillment_status in ('pendente', 'enviado', 'entregue'));
alter table public.orders add column if not exists tracking_code text;
alter table public.orders add column if not exists shipped_at timestamptz;
alter table public.orders add column if not exists followup_sent_at timestamptz;

-- ---------------------------------------------------------------------------
-- Segurança: só admins leem e escrevem pelo navegador; o servidor usa service_role.
-- ---------------------------------------------------------------------------
alter table public.kit_items enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.leads enable row level security;
alter table public.pending_payments enable row level security;

drop policy if exists "admin all kit items" on public.kit_items;
create policy "admin all kit items" on public.kit_items
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin all coupons" on public.coupons;
create policy "admin all coupons" on public.coupons
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read coupon redemptions" on public.coupon_redemptions;
create policy "admin read coupon redemptions" on public.coupon_redemptions
for select using (public.is_admin());

drop policy if exists "admin read leads" on public.leads;
create policy "admin read leads" on public.leads
for select using (public.is_admin());

drop policy if exists "admin delete leads" on public.leads;
create policy "admin delete leads" on public.leads
for delete using (public.is_admin());

drop policy if exists "admin read pending payments" on public.pending_payments;
create policy "admin read pending payments" on public.pending_payments
for select using (public.is_admin());

revoke all on public.coupon_redemptions, public.pending_payments, public.leads from anon;
