# Documentação de Componentes (src/components)

Este documento descreve a finalidade e a lógica de cada componente React encontrado no diretório `src/components` deste projeto.

## Índice
- [BotaoCompartilhar.tsx](#botaocompartilhar.tsx)
- [BotaoCompra.tsx](#botaocompra.tsx)
- [Carousel.tsx](#carousel.tsx)
- [Catalog.tsx](#catalog.tsx)
- [Footer.tsx](#footer.tsx)
- [Galeria.tsx](#galeria.tsx)
- [Header.tsx](#header.tsx)
- [HeaderMobile.tsx](#headermobile.tsx)
- [Hero.tsx](#hero.tsx)
- [HowItWorks.tsx](#howitworks.tsx)
- [ProductCard.tsx](#productcard.tsx)
- [Testimonials.tsx](#testimonials.tsx)
- [ThreeDMarqueeDemo.tsx](#threedmarqueedemo.tsx)
- [Sub-componentes UI (src/components/ui)](#sub-componentes-ui-srccomponentsui)
    - [3d-marquee.tsx](#3d-marquee.tsx)
    - [floating-dock.tsx](#floating-dock.tsx) (Assumindo que seja um componente de UI genérico)

---

## BotaoCompartilhar.tsx

- **Finalidade:** Componente de botão que permite ao usuário compartilhar a URL atual da página (e um título opcional) usando a API `navigator.share` (se disponível) ou copiá-la para a área de transferência.
- **Lógica:**
    - Usa `useState` para gerenciar o estado `copiado` (booleano), indicando se a URL foi copiada.
    - `handleShare` é uma função assíncrona que tenta usar `navigator.share` para compartilhar o conteúdo. Se o `navigator.share` não for suportado, ele copia a URL para a área de transferência e define `copiado` como `true` por 2 segundos.
    - O botão muda sua aparência e texto (`Enviar` vs `Copiado!`) com base no estado `copiado`.
    - Os ícones (`Share`, `ExternalLink`, `Check`) são do `lucide-react`.

---

## BotaoCompra.tsx

- **Finalidade:** Um botão estilizado que direciona o usuário para a página de checkout de um produto específico.
- **Lógica:**
    - Recebe um objeto `produto` como propriedade.
    - Determina o texto (`Baixar Agora` ou `Receber em Casa`) e o ícone do botão (`Download` ou `Package`) com base no `produto.tipo` (`digital` ou `fisico`).
    - Utiliza o componente `Link` do Next.js para navegar para `/checkout?id=${produto.id}`, passando o ID do produto via `query parameter`.
    - Possui estilos de Tailwind CSS para uma aparência vibrante e interativa.

---

## Carousel.tsx

- **Finalidade:** Exibe uma vitrine de produtos destacados em dois carrosséis de rolagem automática que se movem em direções opostas.
- **Lógica:**
    - Utiliza a biblioteca `embla-carousel-react` e o plugin `Autoplay` para a funcionalidade de carrossel.
    - Divide a lista de `PRODUTOS_LISTA` em duas metades: `linhaSuperior` e `linhaInferior`.
    - Cria dois carrosséis Embla separados, um para cada linha.
    - O carrossel superior desliza da esquerda para a direita.
    - O carrossel inferior desliza da direita para a esquerda (`direction: "rtl"`).
    - Ambos os carrosséis possuem reprodução automática com `delay: 3000ms` e são infinitos (`loop: true`).
    - Renderiza `ProductCard` para cada produto em ambos os carrosséis.
    - Inclui estilos JSX para um efeito de fade nas bordas do carrossel.

---

## Catalog.tsx

- **Finalidade:** Exibe uma lista de produtos paginada e filtrável. Permite aos usuários pesquisar por nome, filtrar por tipo (digital/físico) e por tags.
- **Lógica:**
    - Usa `useState` para `categoria`, `tagAtiva` e `paginaAtual`.
    - `useSearchParams` do Next.js para obter o termo de busca da URL.
    - `PRODUTOS_LISTA` é a fonte de dados.
    - `todasTags` é gerada dinamicamente a partir dos produtos.
    - `produtosFiltrados` é um `useMemo` que filtra os produtos com base na busca, categoria e tag ativa.
    - Lógica de paginação calcula `totalPaginas` e `produtosExibidos` com base em `itensPorPagina` (10).
    - A paginação inclui botões de `ChevronLeft`/`ChevronRight` e botões numerados para cada página.
    - Quando os filtros são alterados, `setPaginaAtual(1)` é chamado dentro de um `useEffect` para resetar a paginação para a primeira página. `eslint-disable-next-line` foi usado para desabilitar avisos de linter sobre esse `useEffect` específico, pois a lógica é intencional.
    - Exibe `ProductCard` para cada `produtoExibido`.
    - Apresenta uma mensagem "Nenhum material mágico encontrado" se não houver produtos filtrados.

---

## Footer.tsx

- **Finalidade:** Componente de rodapé da aplicação, contendo informações de branding, links de navegação, contatos e informações de segurança/confiança.
- **Lógica:**
    - Estrutura-se em várias colunas para organização:
        - **Branding**: Exibe o logo e uma breve descrição da marca, com links para redes sociais (Instagram, YouTube, WhatsApp).
        - **Links Rápidos**: Uma lista de links de navegação (ex: Materiais PDF, Sobre a Tia, Blog).
        - **Card de Contato**: Informações de contato como e-mail e telefone, com ícones interativos.
        - **Badge de Confiança**: Um card destacando segurança e qualidade.
    - Utiliza `Image` do Next.js para o logo e ícones do `lucide-react`.
    - Inclui elementos decorativos de fundo (ondas SVG e elementos com `blur` e `animate-pulse`) para um visual vibrante.
    - Possui um rodapé legal com direitos autorais e links de privacidade/termos.

---

## Galeria.tsx

- **Finalidade:** Exibe uma galeria de imagens para um produto, permitindo a visualização da imagem principal e navegação através de miniaturas ou botões.
- **Lógica:**
    - Recebe `imagens` (array de URLs), `nome` (para `alt text`) e `cor` (para estilização da moldura) como `props`.
    - `useState` (`fotoAtiva`) gerencia o índice da imagem exibida atualmente.
    - Funções `próxima` e `anterior` atualizam `fotoAtiva` para navegar ciclicamente pelas imagens.
    - A imagem principal é exibida dentro de uma moldura estilizada com a `cor` fornecida.
    - Botões de navegação (`ChevronLeft`, `ChevronRight`) aparecem ao passar o mouse sobre a imagem principal se houver mais de uma imagem.
    - Miniaturas das imagens são exibidas abaixo, permitindo a seleção direta da imagem principal. A miniatura ativa é destacada.
    - Usa `Image` do Next.js para carregamento otimizado.

---

## Header.tsx

- **Finalidade:** Componente de cabeçalho da aplicação para telas desktop (escondido em telas pequenas), contendo a logo, links para redes sociais, barra de busca e links de navegação principais.
- **Lógica:**
    - Utiliza `useState` para `isSearchOpen` para controlar a visibilidade da barra de busca.
    - `useSearchParams` e `useRouter` do Next.js para gerenciar os parâmetros de busca na URL e a navegação.
    - `handleSearch` atualiza os parâmetros de busca e navega para a seção de catálogo.
    - Layout dividido em três seções:
        - **Esquerda**: Links para redes sociais (Instagram, YouTube, WhatsApp) com ícones e animações.
        - **Centro**: Logo da Tia Rafa, que serve como link para a página inicial.
        - **Direita**: Barra de busca retrátil (expandindo/contraindo com `isSearchOpen`) e links de navegação (`Materiais`, `Sobre`, `Atividades`).
    - O componente `Header` externo decide renderizar `HeaderContent` apenas se o `pathname` for a raiz (`/`).

---

## HeaderMobile.tsx

- **Finalidade:** Componente de navegação inferior fixo e responsivo, projetado para dispositivos móveis (escondido em telas grandes). Ele se esconde ao rolar para baixo e reaparece ao rolar para cima.
- **Lógica:**
    - Usa `useState` para `isVisible` (controla a visibilidade da barra de navegação) e `lastScrollY` (para detectar a direção do scroll).
    - `useEffect` monitora o evento de `scroll` da janela para atualizar `isVisible`, escondendo a barra quando o usuário rola para baixo e mostrando-a ao rolar para cima.
    - `motion` e `AnimatePresence` do `framer-motion` são usados para animações de entrada/saída da barra de navegação (deslizando de baixo para cima).
    - `menuItems` é um array de objetos que define os links de navegação (`Início`, `Materiais`, `Ameis`, `Sobre`), seus ícones (`lucide-react`) e `href`.
    - Cada item de menu é um `Link` do Next.js.
    - O item ativo (`isActive`) recebe feedback visual através de um fundo "glow", um "pontinho" embaixo e o ícone/texto com cores e escala diferentes.

---

## Hero.tsx

- **Finalidade:** Componente de seção inicial (Hero Section) da página, apresentando um título de impacto, uma descrição e botões de chamada para ação.
- **Lógica:**
    - Contém uma imagem de fundo (`/fundo-hero.jpg`) com um overlay de gradiente para melhorar a legibilidade do texto.
    - Elementos decorativos flutuantes (estrelas, brilhos do `lucide-react`) com animações (`animate-bounce`, `animate-pulse`) adicionam um toque lúdico.
    - O conteúdo principal inclui um título (`Educar com Amor e Cor`) com gradiente de texto e uma descrição.
    - Dois botões de ação: um para `Ver Catálogo` (link para `#catalogo`) e outro para `Material Grátis`.
    - Um SVG de onda na parte inferior da seção proporciona uma transição suave para a próxima seção.

---

## HowItWorks.tsx

- **Finalidade:** Seção que explica o processo de aquisição dos materiais digitais em passos simples e destaca os benefícios do serviço.
- **Lógica:**
    - Define um array `steps` contendo os estágios do processo (Escolha, Pagamento, E-mail, Imprima), cada um com ícone (`lucide-react`), título, descrição e cores para estilização.
    - Define um array `features` com benefícios adicionais (Download Imediato, Impressão Ilimitada, Garantia de 7 Dias, Acesso Mobile).
    - O layout apresenta os passos em um grid responsivo, com cada passo sendo um card interativo com ícone animado e contador (`01`, `02`, etc.).
    - Ondas SVG e uma imagem de fundo com opacidade criam um ambiente visual atraente.
    - Inclui um card final de "Chamada para Ação" que enfatiza o "Acesso Vitalício Garantido" e um botão para explorar materiais.

---

## ProductCard.tsx

- **Finalidade:** Exibe um card individual para um produto, com sua imagem, nome, preço, tipo (digital/físico) e tags. Funciona como um link para a página de detalhes do produto.
- **Lógica:**
    - Recebe `id`, `nome`, `preco`, `imagem` (ou `imagens`), `cor`, `tipo` e `tags` como `props`.
    - Exibe uma badge no canto superior direito indicando o `tipo` do produto (`DIGITAL` ou `FÍSICO`) com ícones (`Download`, `Package` do `lucide-react`).
    - A imagem principal do produto é exibida em um contêiner com `cor` de fundo, usando `Image` do Next.js.
    - Se houver mais de uma imagem, uma badge adicional (`+X fotos`) é mostrada.
    - Exibe tags relevantes para o produto.
    - Mostra o `nome` e `preco` formatado.
    - Inclui um "Botão de Carrinho" (atualmente com `onClick` vazio, mas preparado para adicionar a funcionalidade de carrinho) com um tooltip.
    - Para produtos `fisico`, exibe uma informação extra de "Entrega para todo Brasil".
    - O card inteiro é um `Link` para `/produto/${id}`.

---

## Testimonials.tsx

- **Finalidade:** Seção dedicada a exibir depoimentos de clientes satisfeitos, reforçando a credibilidade e qualidade dos materiais.
- **Lógica:**
    - Define um array `depoimentos` com dados como `nome`, `funcao`, `texto` e `foto` dos clientes.
    - O layout exibe um título e uma breve descrição da seção.
    - Cada depoimento é renderizado em um card individual, com:
        - Ícone de aspas (`Quote` do `lucide-react`) decorativo.
        - Estrelas de avaliação (`Star`).
        - O texto do depoimento.
        - Foto do cliente com `Image` do Next.js e um badge de verificação (`CheckCircle`).
    - Utiliza `motion` do `framer-motion` para animações de entrada (`initial`, `whileInView`).
    - Uma "Badge de Verificação Inferior" no final da seção lista benefícios como "Compra 100% Segura", "Material Validado", "Acesso Instantâneo".

---

## ThreeDMarqueeDemo.tsx

- **Finalidade:** Um componente de demonstração que utiliza o sub-componente `ThreeDMarquee` para exibir uma rolagem infinita e tridimensional de imagens.
- **Lógica:**
    - Define um array `images` com uma lista de URLs para as imagens a serem exibidas no marquee.
    - Renderiza o componente `ThreeDMarquee` (importado de `@/components/ui/3d-marquee`) passando o array `images` como propriedade.
    - A função `ThreeDMarquee` é responsável pela lógica e renderização do efeito de rolagem 3D.

---

## Sub-componentes UI (src/components/ui)

Estes são componentes de interface de usuário mais genéricos, frequentemente utilizados por outros componentes para construir layouts e interações específicas.

### 3d-marquee.tsx

- **Finalidade:** (Assumindo a lógica pelo nome e uso em `ThreeDMarqueeDemo.tsx`) Este componente provavelmente implementa um efeito de "marquee" (rolagem infinita) com um estilo 3D ou paralaxe para um conjunto de imagens. É um componente de apresentação visual.
- **Lógica:**
    - Recebe um array de URLs de `images`.
    - Utiliza propriedades CSS para criar o efeito de rolagem contínua.
    - Pode aplicar transformações 3D (rotação, perspectiva) às imagens ou ao contêiner de rolagem para dar a sensação de profundidade.
    - Renderiza as imagens dentro de um contêiner que simula uma fita ou trilha de rolagem.

### floating-dock.tsx

- **Finalidade:** (Assumindo a lógica pelo nome e convenção de UI) Este componente provavelmente cria um elemento de interface de usuário que "flutua" na tela, como um "dock" de aplicativos ou uma barra de navegação que se posiciona de forma destacada, geralmente com efeitos visuais como blur ou sombra.
- **Lógica:**
    - Pode receber `children` para renderizar conteúdo dentro do dock.
    - Aplica estilos CSS (provavelmente Tailwind CSS) para posicionamento fixo, blur de fundo, arredondamento e sombras, dando a impressão de um elemento "flutuante" sobre o conteúdo.
    - Geralmente, ele lida com seu próprio estado de visibilidade ou interações básicas.
