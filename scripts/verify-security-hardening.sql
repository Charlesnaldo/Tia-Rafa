-- Teste isolado: usa apenas registros artificiais e desfaz todas as escritas.
begin;
set local role service_role;
do $$
declare test_id text := 'security-check-' || gen_random_uuid()::text;
  result jsonb; saved_token uuid;
begin
  if public.consume_api_rate_limit(test_id, 1, 86400) is distinct from true then
    raise exception 'Primeira requisicao deveria ser aceita';
  end if;
  if public.consume_api_rate_limit(test_id, 1, 86400) is distinct from false then
    raise exception 'Cota excedida deveria ser bloqueada';
  end if;
  result := public.claim_payment_email(test_id, 'test-product', '{"html":"original"}'::jsonb);
  if result->>'state' <> 'claimed' then raise exception 'Primeira entrega nao foi reservada'; end if;
  saved_token := (result->>'token')::uuid;
  result := public.claim_payment_email(test_id, 'test-product', '{"html":"changed"}'::jsonb);
  if result->>'state' <> 'busy' then raise exception 'Entrega concorrente nao foi bloqueada'; end if;
  update public.payment_email_deliveries set lease_until = now() - interval '1 second'
  where payment_id = test_id and product_id = 'test-product';
  result := public.claim_payment_email(test_id, 'test-product', '{"html":"changed"}'::jsonb);
  if result->>'state' <> 'claimed' or result->'payload'->>'html' <> 'original'
    or (result->>'token')::uuid = saved_token then
    raise exception 'Nova tentativa nao preservou corpo e nova reserva';
  end if;
  update public.payment_email_deliveries set sent_at = now(), email_payload = null
  where payment_id = test_id and product_id = 'test-product';
  result := public.claim_payment_email(test_id, 'test-product', '{}'::jsonb);
  if result->>'state' <> 'sent' then raise exception 'Entrega concluida foi reaberta'; end if;
  result := public.claim_payment_email(test_id, 'expired-product', '{}'::jsonb);
  update public.payment_email_deliveries
  set first_attempt_at = now() - interval '24 hours', lease_until = now() - interval '1 second'
  where payment_id = test_id and product_id = 'expired-product';
  result := public.claim_payment_email(test_id, 'expired-product', '{}'::jsonb);
  if result->>'state' <> 'manual_review' then raise exception 'Entrega antiga deveria exigir conciliacao'; end if;
end;
$$;
reset role;
do $$
declare role_name text; table_name text; function_name text;
begin
  foreach role_name in array array['anon', 'authenticated'] loop
    foreach table_name in array array['public.api_rate_limits', 'public.payment_email_deliveries'] loop
      if has_table_privilege(role_name, table_name, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then
        raise exception 'Acesso indevido: % em %', role_name, table_name;
      end if;
    end loop;
    foreach function_name in array array[
      'public.consume_api_rate_limit(text,integer,integer)', 'public.claim_payment_email(text,text,jsonb)'
    ] loop
      if has_function_privilege(role_name, function_name, 'EXECUTE') then
        raise exception 'Execucao indevida: % em %', role_name, function_name;
      end if;
    end loop;
  end loop;
  if exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ('api_rate_limits', 'payment_email_deliveries') and not c.relrowsecurity) then
    raise exception 'RLS deveria estar habilitado';
  end if;
end;
$$;
rollback;
select 'OK: cotas, reservas, reenvios e permissoes validados; escritas desfeitas' as verification;
