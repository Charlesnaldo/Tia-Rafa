# Performance e validação da loja Tia Rafa

Data: 13 de novembro de 2026. Referência anterior: commit 145a3ed.

## Medições mobile

| Métrica | Antes | Depois | Redução medida |
| --- | ---: | ---: | ---: |
| LCP | 6,83 s | 4,05 s | 40.7% |
| CLS | 0,481 | 0,000 | 100.0% |
| TBT | 6.099 ms | 1.686 ms | 72.4% |
| Transferência total da prévia | 5,37 MB | 1,47 MB | 72.7% |
| Transferência de imagens da prévia | 1,34 MB | 0,34 MB | 74.4% |

Lighthouse: 12 → 51/100. MB decimais. Medianas calculadas separadamente para cada métrica, em três execuções por versão.

### Método e limites

- Next.js 16.4.2 em build de produção Turbopack nas duas versões, Chrome headless 157, Lighthouse 13.6.0, preset mobile de 412 × 823, DPR 1,75, CPU simulada 4×, RTT 150 ms e throughput 1.638,4 Kbps.
- O ambiente não possui credenciais Supabase. A comparação usa a mesma prévia local e um snapshot de oito produtos públicos da loja. Nenhum dado privado, pedido real ou pagamento foi alterado.
- URL das duas medições: http://localhost:3200. A ponte local atende catálogo/imagens públicos e encaminha a aplicação para a porta 3100. Ela bufferiza respostas e não repassa compressão de transferência; os pesos são desse cenário local, não os bytes gzip/Brotli do CDN publicado.
- Armazenamento do navegador reiniciado pelo Lighthouse entre execuções; caches de imagem e de dados do servidor podem estar aquecidos. Há variação de CPU/rede entre amostras. Os números não são CrUX, métricas de visitantes ou promessa de desempenho em produção.
- A medição inicial sem produtos foi descartada. Os relatórios válidos começam com baseline, não com before. O depois inclui os três novos destaques.

Relatórios completos: [antes](../.local/performance/baseline-summary.json), [depois](../.local/performance/after-summary.json). HTML e JSON de cada execução estão na mesma pasta, ignorada pelo Git. As capturas também permanecem disponíveis localmente.

Apesar das reduções, o LCP e o TBT deste laboratório ainda ficam acima das referências de 2,5 s e 200 ms. O perfil ainda mostra custo de execução do framework e do Google Analytics. Não foi desativada a medição de acesso para favorecer a pontuação. Depois de publicar, a próxima verificação deve usar a URL real com compressão/CDN e, se o custo persistir, avaliar a hidratação e a configuração de analytics.

## Mudanças por item

1. **Fundos e configuração.** Variantes limitadas a 1920 px; deviceSizes e imageSizes solicitados; AVIF/WebP, qualidades permitidas e TTL de um ano. Fundos importados estaticamente recebem URL com hash. Hero mantém preload; fundos inferiores usam lazy. A compressão gera novos arquivos e preserva os originais.
2. **Mural e carrossel.** Sete fotos distintas no mural, com uma repetição: 14 imagens em vez de 28. Next Image com sizes, quality 70 e lazy. As referências inexistentes aula2.webp/aula3.webp foram substituídas por versões geradas dos JPGs existentes. Animação em CSS com transform e redução de movimento; plano 3D recentralizado e verificado visualmente no mobile. O Embla existente deixou de criar cópias artificiais para preencher linhas pequenas.
3. **Catálogo no HTML.** Consulta compartilhada no servidor, cache/revalidação de 60 segundos e tratamento de falha sem guardar um catálogo vazio como resultado válido. Os 8 cards estão no HTML, antes do bootstrap. Busca é lida no servidor; filtros, modal e ações do carrinho permanecem interativos. Skeleton de rota com espaço reservado substitui o texto de espera. Duas primeiras fotos podem carregar eager, as demais lazy, sem preload adicional de produto.
4. **Runtime e bundle.** Mural e depoimentos dispensam JavaScript de animação na home. Embla é importado quando o visitante se aproxima da seção. Removidas dependências sem uso motion e class-variance-authority; framer-motion permanece onde ainda é usado. Fredoka continua em next/font com swap, sem o peso 300 não utilizado. Analytics já usava next/script/lazyOnload e foi preservado; o chat não está montado na home. Logos agora reservam a proporção correta e usam o original reduzido. O Lighthouse identificou o logo como LCP real no mobile, em vez do fundo decorativo: por isso ele recebe eager/fetchPriority high, como exceção fundamentada ao lazy geral, sem outro preload. O prefetch dos menus foi desativado para não baixar páginas antes da escolha do visitante. Removidas as opções experimentais inlineCss/optimizeCss: os 120 KB de CSS estavam duplicados entre HTML e RSC; agora a folha é cacheável separadamente. O favicon era um PNG de 2000 × 2000 disfarçado de ICO e passou de 1.303.800 para 8.119 bytes, preservando a marca em ICO válido de 16/32/48 px.
5. **Contatos e conteúdo.** E-mail confirmado sac@tiarafaela.com.br e WhatsApp 5585985122803 centralizados. Cabeçalho e rodapé usam os mesmos dados. YouTube genérico oculto até receber a URL oficial. Novas rotas /privacidade e /termos, com textos base em português e campos [PREENCHER]. Alts genéricos do mural/galeria substituídos; fundos decorativos e repetições ocultas de leitores de tela mantêm alt vazio de propósito. IDs/âncoras catalogo permanecem estáveis; texto visível usa catálogo.
6. **Destaques e validação.** Três materiais escolhidos aleatoriamente uma vez, com autorização do proprietário: História da boneca Abayomi, Painel para trabalhar as profissões e Coração Autismo Quebra-cabeça. A seção fica depois do hero e antes do passo a passo, com preço real e botão Comprar. O título é Materiais em destaque, sem alegar ranking de vendas. A validação encontrou e corrigiu hidratação do carrinho com itens no localStorage; o estado inicial agora coincide com o servidor sem apagar a compra salva.

### Fontes locais comprimidas

| Arquivo | Antes | Gerado | Largura gerada |
| --- | ---: | ---: | ---: |
| public/background2.jpg | 12,5 KB | 11,3 KB | 612 px |
| public/fundo-hero.webp | 215,1 KB | 39,3 KB | 1200 px |
| public/fundo-footer.webp | 58,0 KB | 55,7 KB | 1920 px |
| public/logo.webp | 182,9 KB | 69,9 KB | 760 px |
| src/app/favicon.ico | 1.303,8 KB | 8,1 KB | 16/32/48 px |

Fotos do mural: variantes de até 800 px de largura, sem ampliar arquivos pequenos. A largura menor não garante que toda recompressão isolada seja menor em bytes; a seleção do formato e o sizes limitam o arquivo efetivamente transferido. Nenhuma imagem depende de conversão manual pendente.

## Bundle e cache

Foi executado @next/bundle-analyzer com build Webpack para inspecionar módulos e divisão de código, e um build Turbopack para a entrega e as medições. Relatórios preservados em [.local/performance/bundle-analysis](../.local/performance/bundle-analysis/client.html). A análise precede a última rodada guiada pelo Lighthouse (favicon, prefetch, CSS, destaques e validação); não representa o bundle exato final nem deve ser confundida com o total de JavaScript transferido no Lighthouse. A rodada intermediária que ainda tinha LCP pior foi investigada, e não usada como resultado final.

Headers conferidos no servidor final:

- /_next/static/media/fundo-hero.2j7-q02x7l4e4.webp: HTTP 200, Cache-Control: public, max-age=31536000, immutable.
- /fundo-hero.webp: HTTP 200, Cache-Control: public, max-age=0.

Não foi adicionado cache imutável global a /public: URLs sem hash precisam aceitar substituições. Imagens de produtos continuam com a autorização e cache curto existentes no proxy, para respeitar a publicação/desativação do produto. Não foi tornado público o bucket de PDFs pagos.

Para servidor pequeno, a melhor continuação é gerar as variantes de capas no upload e servir os derivados, preservando a checagem de publicação e o cache limitado. Fundos, logo e mural já têm derivados gerados localmente. Um CDN pode distribuir somente as capas públicas, com versionamento; não recomendo expor o bucket de materiais pagos ou enviar PDFs ao CDN. Nenhum serviço pago foi contratado ou reconfigurado.

## Verificação

- Build final Next.js e TypeScript: passaram.
- npm run lint: sem erros; dois avisos já existentes de navegação interna no checkout. Next 16 não oferece next lint; o projeto usa ESLint diretamente.
- Testes de segurança existentes: 14/14 passaram. O carregador de testes foi adaptado ao novo módulo de servidor, preservando as verificações de autorização e de ausência de caminhos de PDFs na API pública.
- Navegador: 320, 390, 768, 1440 px, sem overflow horizontal. Modal, busca, filtros, carrinho persistido, botões dos destaques e formulário de checkout passaram, sem erros de JavaScript ou imagens com erro HTTP.
- Rotas verificadas com HTTP 200: /privacidade, /termos, /sobre, /blog, /area-do-aluno. Mural revisado em captura e com reduced-motion.
- Nenhum pagamento real foi submetido. A entrega de PDFs de uma compra real e os recursos autenticados da área do aluno não foram exercitados sem credenciais/pedido de teste.

Evidências: [verificação no navegador](../.local/performance/verification.json), [mobile](../.local/performance/layout-390.png), [desktop](../.local/performance/layout-1440.png), [mural](../.local/performance/mobile-mural.png), [destaques](../.local/performance/mobile-featured.png), [modal](../.local/performance/mobile-product-dialog.png), [carrinho](../.local/performance/mobile-cart.png), [checkout](../.local/performance/mobile-checkout.png).

## Reprodução

Use Node 22.19 ou superior para a versão instalada do Lighthouse. Em terminais separados:

1. node scripts/performance-preview.mjs
2. Defina CATALOG_PREVIEW_ORIGIN=http://localhost:3200 apenas na sessão local; execute npm run build e npm run start -- --port 3100.
3. npm run perf:audit -- after http://localhost:3200 3
4. node scripts/verify-storefront.mjs http://localhost:3200

Para reprocessar originais: node scripts/optimize-images.mjs e node scripts/optimize-images.mjs --testimonials. Para o favicon: node scripts/optimize-favicon.mjs. Para analisar: npm run build:analyze. Em produção, deixe CATALOG_PREVIEW_ORIGIN ausente e configure as credenciais Supabase do ambiente; a prévia é somente de leitura e não aceita pagamentos.

## Pendências do proprietário

- URL oficial do YouTube; ícone permanece oculto até a confirmação.
- Confirmar se o depoimento Alessadra deve ser Alessandra. O nome atual foi preservado, com TODO, porque o arquivo da foto não comprova a identidade.
- Completar e revisar os campos [PREENCHER] dos textos legais: identificação, CPF/CNPJ, endereço, licença, prazos de entrega/acesso, retenção, operadores, transferências e canal do encarregado quando aplicável. Validar também base legal e mecanismo de escolha dos recursos de analytics que estiverem ativos.
- O e-mail já foi confirmado; não há pendência de endereço de atendimento ou compressão manual.

Os textos são bases de revisão, sem declaração de conformidade automática. Referências utilizadas: [ANPD — direitos dos titulares](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares) e [Procon-SP — compras online](https://www.procon.sp.gov.br/reclamacoes-de-compras-online/).

## Arquivos tocados

- .gitignore
- docs/performance.md
- next.config.mjs
- package-lock.json
- package.json
- public/optimized/background2.webp
- public/optimized/fundo-footer.webp
- public/optimized/fundo-hero.webp
- public/optimized/logo.webp
- public/optimized/testimonials/alessandra.webp
- public/optimized/testimonials/aula2.webp
- public/optimized/testimonials/aula3.webp
- public/optimized/testimonials/aula4.webp
- public/optimized/testimonials/aula5.webp
- public/optimized/testimonials/aula6.webp
- public/optimized/testimonials/aula7.webp
- public/optimized/testimonials/bocadosapo.webp
- public/optimized/testimonials/leoeaarvore.webp
- public/optimized/testimonials/lud.webp
- public/optimized/testimonials/raniele.webp
- scripts/analyze-bundle.mjs
- scripts/measure-performance.mjs
- scripts/optimize-favicon.mjs
- scripts/optimize-images.mjs
- scripts/performance-preview.mjs
- scripts/security.test.cjs
- scripts/verify-storefront.mjs
- src/app/api/products/route.ts
- src/app/favicon.ico
- src/app/globals.css
- src/app/layout.tsx
- src/app/loading.tsx
- src/app/page.tsx
- src/app/privacidade/page.tsx
- src/app/sobre/page.tsx
- src/app/termos/page.tsx
- src/components/ActivityCard.tsx
- src/components/BuyProductButton.tsx
- src/components/Carousel.tsx
- src/components/Catalog.tsx
- src/components/CatalogClient.tsx
- src/components/DeferredCarousel.tsx
- src/components/FallbackImage.tsx
- src/components/FeaturedMaterials.tsx
- src/components/Footer.tsx
- src/components/Galeria.tsx
- src/components/Header.tsx
- src/components/HeaderMobile.tsx
- src/components/HeaderMobileTop.tsx
- src/components/Hero.tsx
- src/components/HowItWorks.tsx
- src/components/LegalPage.tsx
- src/components/ProductCard.tsx
- src/components/Testimonials.tsx
- src/components/ThreeDMarqueeDemo.tsx
- src/components/WhatsAppFloatingButton.tsx
- src/components/ui/3d-marquee.tsx
- src/config/contact.ts
- src/context/CartContext.tsx
- src/lib/products/catalog-model.ts
- src/lib/products/catalog-server.ts
- src/lib/products/useProductsCatalog.ts

## Ajuste orientado pelo PageSpeed mobile (13/11/2026)

Relatório público: https://pagespeed.web.dev/analysis/https-www-tiarafaela-com-br/7r0nck0ocv?form_factor=mobile

- Nota mobile: 83; FCP 1,1 s; LCP 4,2 s; TBT 73,5 ms; CLS 0. O elemento LCP é o logo mobile.
- O relatório aponta aproximadamente 197 KiB de economia em imagens e conexão antecipada ao Supabase não utilizada pelo navegador.
- O logo recebe preload responsivo somente até 1023 px e decodificação síncrona. Os tamanhos intermediários 192, 320 e 480 px evitam saltos excessivos entre variantes. O catálogo informa a largura real das imagens descontando margens, espaçamento e padding dos cards.
- O proxy continua validando produto ativo e imagem publicada; seus tamanhos permitidos vêm da mesma lista utilizada pelo loader. Cache e autorização não foram ampliados.
- Build e 14 testes de segurança passaram; lint sem erros (dois avisos preexistentes no checkout). A validação visual inicial confirmou catálogo, modal, filtros, carrinho, destaques e ausência de overflow em 320/390/768/1440 px, sem erros JS ou imagens quebradas.
- O laboratório local usa capas públicas de 640 px redimensionadas para simular as variantes ainda não publicadas. Sua execução Lighthouse teve LCP 21,7 s e TBT 10,3 s, portanto não estabelece ganho em relação à medição do Google. Não comparar as notas de ambientes diferentes. Uma nova execução do PageSpeed após publicação é necessária para confirmar o resultado.

## Compatibilidade do logo mobile (13/11/2026)

Uma captura enviada pelo usuário mostra um retângulo preto sobre parte do topo no Safari de iPhone. A causa exata não foi reproduzida em um dispositivo físico. Para retirar a conversão de imagens transparentes da região afetada, o cabeçalho mobile passa a usar PNGs estáticos de 240/480 px (19.872/58.843 bytes), com URLs versionadas pelo build, srcset 1x/2x e preload correspondente. A decodificação volta a ser assíncrona. O logo desktop e as capas permanecem no fluxo existente.

Regeneração: `node scripts/optimize-mobile-logo.mjs`. Build e lint sem erros. A confirmação do desaparecimento do artefato deve ser feita também no aparelho que apresentou a falha; emulação de viewport não equivale ao Safari real.
