-- Execute no SQL Editor do Supabase ANTES de publicar o codigo.
begin;

create table if not exists public.api_rate_limits (
  bucket_key text primary key,
  hits integer not null,
  expires_at timestamptz not null
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from public, anon, authenticated;
revoke all on public.api_rate_limits from service_role;
grant select, insert, update, delete on public.api_rate_limits to service_role;
create index if not exists api_rate_limits_expires_at_idx on public.api_rate_limits (expires_at);

create or replace function public.consume_api_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare bucket text; accepted integer; current_time_value timestamptz := clock_timestamp();
begin
  if p_limit < 1 or p_window_seconds < 1 or p_window_seconds > 86400 or length(p_key) > 200 then
    raise exception 'Invalid rate limit';
  end if;
  bucket := p_key || ':' || floor(extract(epoch from current_time_value) / p_window_seconds)::text;
  delete from public.api_rate_limits where expires_at <= current_time_value;
  insert into public.api_rate_limits as limits (bucket_key, hits, expires_at)
  values (bucket, 1, to_timestamp((floor(extract(epoch from current_time_value) / p_window_seconds) + 1) * p_window_seconds))
  on conflict (bucket_key) do update set hits = limits.hits + 1 where limits.hits < p_limit
  returning hits into accepted;
  return accepted is not null;
end;
$$;
revoke all on function public.consume_api_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer) to service_role;

-- Persiste o corpo exato do e-mail para repetir a mesma chave no Resend.
create table if not exists public.payment_email_deliveries (
  payment_id text not null,
  product_id text not null,
  email_payload jsonb,
  claim_token uuid not null,
  first_attempt_at timestamptz not null default now(),
  lease_until timestamptz not null,
  sent_at timestamptz,
  provider_email_id text,
  primary key (payment_id, product_id)
);
alter table public.payment_email_deliveries enable row level security;
revoke all on public.payment_email_deliveries from public, anon, authenticated;
revoke all on public.payment_email_deliveries from service_role;
grant select, insert, update on public.payment_email_deliveries to service_role;

create or replace function public.claim_payment_email(p_payment_id text, p_product_id text, p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare delivery public.payment_email_deliveries%rowtype; token uuid := gen_random_uuid();
begin
  insert into public.payment_email_deliveries (payment_id, product_id, email_payload, claim_token, lease_until)
  values (p_payment_id, p_product_id, p_payload, token, clock_timestamp() + interval '2 minutes')
  on conflict do nothing;

  select * into delivery from public.payment_email_deliveries
  where payment_id = p_payment_id and product_id = p_product_id for update;
  if delivery.sent_at is not null then return jsonb_build_object('state', 'sent'); end if;
  -- O Resend guarda a chave por 24h. Nunca tentar de novo apos essa janela.
  if delivery.first_attempt_at < clock_timestamp() - interval '23 hours' then
    return jsonb_build_object('state', 'manual_review');
  end if;
  if delivery.claim_token <> token and delivery.lease_until > clock_timestamp() then
    return jsonb_build_object('state', 'busy');
  end if;
  update public.payment_email_deliveries set claim_token = token, lease_until = clock_timestamp() + interval '2 minutes'
  where payment_id = p_payment_id and product_id = p_product_id;
  return jsonb_build_object('state', 'claimed', 'token', token, 'payload', delivery.email_payload);
end;
$$;
revoke all on function public.claim_payment_email(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.claim_payment_email(text, text, jsonb) to service_role;

-- Funcoes existentes do esquema de e-commerce: todas as referencias ja sao qualificadas.
alter function public.is_admin() set search_path = '';
alter function public.touch_updated_at() set search_path = '';

commit;
