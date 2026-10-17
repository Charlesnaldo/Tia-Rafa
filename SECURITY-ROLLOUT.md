# Ativacao das correcoes de seguranca

## Estado do Supabase

Aplicado em 17/10/2026 no projeto **Tia Rafa** (`acqmtxttsirgxhvrgdjn`), branch `main` de producao, pelo SQL Editor. As duas tabelas e funcoes de seguranca foram criadas com RLS e acesso restrito ao servidor. As funcoes usam `SECURITY INVOKER`, sem elevar os privilegios de quem as chama. Tambem foi fixado o `search_path` das funcoes existentes `is_admin()` e `touch_updated_at()`.

O teste [scripts/verify-security-hardening.sql](scripts/verify-security-hardening.sql) passou no PostgreSQL real com o papel `service_role`: cota excedida bloqueada, segunda reserva bloqueada, corpo original preservado na nova tentativa, entrega concluida nao reaberta, entregas antigas encaminhadas para conciliacao e permissoes publicas negadas. Todas as escritas desse teste foram revertidas com `ROLLBACK`. Nenhum pagamento ou e-mail foi disparado.

O usuario informou que o segredo do webhook ja esta nas Secrets do Supabase. O webhook deste projeto roda no Next.js e le `process.env.MP_WEBHOOK_SECRET`: a mesma variavel precisa estar configurada na hospedagem do site, pois Secrets de Edge Functions do Supabase nao sao automaticamente disponibilizadas ao Next.js. Essa configuracao da hospedagem ainda nao foi verificada. A protecao contra senhas vazadas esta indisponivel no plano Free do Supabase (a interface exige Pro ou superior); nao foi feita contratacao de plano.

## Antes de publicar

1. **Concluido no projeto acima.** Para outro ambiente, execute [scripts/security-hardening.sql](scripts/security-hardening.sql) no SQL Editor do Supabase. O script adiciona duas tabelas privadas e duas funcoes acessiveis somente a `service_role`, alem de fixar o `search_path` das duas funcoes antigas. Nao altera os produtos, clientes ou pedidos existentes.
2. No painel de desenvolvedores do Mercado Pago, habilite Webhooks de pagamentos para `https://www.tiarafaela.com.br/api/webhook/mercadopago`. Configure `MP_WEBHOOK_SECRET` na hospedagem do servidor Next.js com o segredo **oficial de assinatura** mostrado nesse painel. Um antigo token arbitrario enviado em `?secret=` nao serve. O novo codigo nunca inclui segredos nas URLs de notificacao.
3. Mantenha as credenciais de servidor Supabase, `MP_ACCESS_TOKEN` e `RESEND_API_KEY` configuradas. Publique o codigo somente depois dos passos anteriores.

Sem a migracao, chat e entregas falham de forma fechada; sem o segredo, o webhook responde 503 e nao envia materiais. A mudanca local nao atualiza o site publicado automaticamente.

## Comportamento esperado

- **Pagamento:** `/api/process_payment` grava um identificador aleatorio em cookie HttpOnly e somente seu hash no metadata do pagamento/preferencia. `/api/payment_status` exige o cookie correspondente. A chamada do navegador continua igual, inclusive no retorno de cartao. Pagamentos criados antes da mudanca nao possuem esse vinculo e nao podem ser consultados por essa API; o processamento do webhook continua independente do cookie.
- **Webhook:** valida HMAC SHA-256, ID, request ID e timestamp (tolerancia de 10 minutos). Consulta o pagamento diretamente no Mercado Pago antes da entrega.
- **Entrega:** reserva atomicamente um registro por pagamento/produto no Supabase. Concorrentes aguardam uma nova notificacao; uma reserva expira em 2 minutos. Em caso de falha, a nova tentativa usa o mesmo corpo salvo e a mesma chave de idempotencia do Resend. Entregas concluidas nunca sao reenviadas. Falhas nao sao tratadas como sucesso.
- **Falhas prolongadas:** apos 23 horas da primeira tentativa, um envio sem confirmacao exige conciliacao manual com o Resend. Isso evita reutilizar automaticamente uma chave depois da janela de idempotencia de 24h do provedor. Consulte `payment_email_deliveries` para localizar registros sem `sent_at`. Confirme no Resend antes de liberar qualquer novo envio; nao apague reservas indiscriminadamente. O corpo salvo contem dados de entrega e anexos, fica privado e e removido quando o envio e confirmado.
- **Chat:** no maximo 2000 caracteres e 8 KiB por requisicao; cotas compartilhadas no banco de 10 requisicoes/minuto por IP, 100/minuto no total e 1000/dia no total. O reset usa janelas fixas. O header de IP usado e o sobrescrito pela Vercel; fora dela, a cota individual usa um bucket compartilhado ate configurar explicitamente um proxy confiavel. A resposta publica nao inclui `raw` nem detalhes internos do n8n.
- **Imagens:** somente caminhos da galeria de produtos ativos podem ser baixados pelo proxy. As fotos sao redimensionadas em WebP no servidor (miniaturas ate 1600px), com cache publico limitado a 60 segundos; a autorizacao e verificada em cada nova busca na origem. Originais e PDFs nao sao alterados. A galeria considera publicados os arquivos da pasta `<produto>/imagens`, como o catalogo e o painel existentes. Um loader especifico evita o erro `INVALID_IMAGE_OPTIMIZE_REQUEST` da Vercel para imagens servidas por rotas dinamicas.
- **Catalogo:** nao seleciona nem retorna `material_path`.

## Validacao

```powershell
node --test scripts/security.test.cjs
npm run lint
npm run build
npm audit --omit=dev
```

Os testes de codigo usam servicos simulados; nao criam pagamentos, nao enviam e-mails e nao modificam o banco real. A aplicacao da migracao e a entrega real precisam ser verificadas separadamente em ambiente de teste antes de publicar.

As dependencias foram atualizadas para Next.js 16.4.2, Resend 6.34.1 e Mercado Pago 3.6.1. A auditoria de producao (`--omit=dev`) ficou sem alertas. A auditoria completa ainda aponta cinco alertas altos na cadeia de desenvolvimento `eslint-config-next -> fast-glob -> micromatch -> braces`; a sugestao automatica de downgrade do ESLint/Next nao foi aplicada. Esses alertas nao fazem parte do conjunto de dependencias de producao.

Referencias: [assinaturas do Mercado Pago](https://www.mercadopago.com.br/developers/en/docs/checkout-pro-orders/resources/notifications/webhooks), [idempotencia do Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).
