"use client";

import { useState, Suspense, useMemo, useEffect, useRef } from "react";
import { ShoppingCart, FileText, Search, SearchX, Zap, ChevronLeft, ChevronRight, Download, X, Sparkles, Package, ShieldCheck } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation"; // Import useRouter
import { type Produto } from "@/constants/produtos"; // Import Produto type
import FallbackImage from "@/components/FallbackImage";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext"; // Import useCart
import { useProductsCatalog } from "@/lib/products/useProductsCatalog";

function CatalogContent() {
  const searchParams = useSearchParams();
  const textoBusca = searchParams.get("busca")?.trim() || "";
  const busca = textoBusca.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const router = useRouter(); // Initialize useRouter
  const { addToCart } = useCart(); // Initialize useCart
  const { productsArray: produtosArray, loaded } = useProductsCatalog();

  // CONFIGURAÃƒâ€¡ÃƒÆ’O DO FUNDO

  const [categoria, setCategoria] = useState<'todos' | 'digital' | 'fisico'>('todos');
  const [tagAtiva, setTagAtiva] = useState<string>('Tudo');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [indiceFotoModal, setIndiceFotoModal] = useState(0);
  const modalRef = useRef<HTMLDialogElement>(null);

  // LÃƒÂ³gica de PaginaÃƒÂ§ÃƒÂ£o
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10; // Exibe 10 produtos por pÃƒÂ¡gina

  const todasTags = useMemo(() => {
    const uniqueTags = new Set<string>();
    for (const produto of produtosArray) {
      if (!produto.tags) continue;
      for (const tag of produto.tags) {
        uniqueTags.add(tag);
      }
    }
    return ["Tudo", ...Array.from(uniqueTags)];
  }, [produtosArray]);

  // Filtro de produtos
  const produtosFiltrados = useMemo(() => {
    const filtrados = produtosArray.filter((produto) => {
      const matchesBusca = produto.nome.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(busca);
      const matchesCategoria = categoria === 'todos' || produto.tipo === categoria;
      const matchesTag = tagAtiva === 'Tudo' || (produto.tags && produto.tags.includes(tagAtiva));
      return matchesBusca && matchesCategoria && matchesTag;
    });
    return filtrados;
  }, [busca, categoria, tagAtiva, produtosArray]);

  // CÃƒÂ¡lculos de PaginaÃƒÂ§ÃƒÂ£o
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const produtosExibidos = produtosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const handleAddToCart = (produto: Produto) => {
    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem || (produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : "/embreve.jpg"),
    }, 1); // Add 1 quantity by default
    // Optionally add a toast notification here
  };

  const handleBuyNow = (produto: Produto) => {
    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem || (produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : "/embreve.jpg"),
    }, 1); // Add 1 quantity by default
    router.push('/carrinho'); // Redirect to cart page
  };

  const getImagensDoProduto = (produto: Produto) => {
    const imagens = [...(produto.imagens || [])].filter(Boolean);
    if (produto.imagem && !imagens.includes(produto.imagem)) {
      imagens.unshift(produto.imagem);
    }
    return imagens.length > 0 ? imagens : ["/embreve.jpg"];
  };

  const abrirModalProduto = (produto: Produto, imagemInicial?: string) => {
    const imagens = getImagensDoProduto(produto);
    const indiceInicial = imagemInicial ? Math.max(imagens.indexOf(imagemInicial), 0) : 0;
    setProdutoSelecionado(produto);
    setIndiceFotoModal(indiceInicial);
  };

  const handleNavegarFotoModal = (direcao: "anterior" | "proxima") => {
    if (!produtoSelecionado) return;
    const imagens = getImagensDoProduto(produtoSelecionado);
    if (imagens.length <= 1) return;
    setIndiceFotoModal((indiceAtual) => (
      direcao === "proxima"
        ? (indiceAtual + 1) % imagens.length
        : (indiceAtual - 1 + imagens.length) % imagens.length
    ));
  };

  useEffect(() => {
    const modal = modalRef.current;
    if (!produtoSelecionado || !modal) return;

    const previousFocus = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The browser's top layer escapes the hero's isolated stacking context.
    modal.showModal();

    return () => {
      modal.close();
      document.body.style.overflow = originalOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [produtoSelecionado]);

  return (
    <section
      className="relative pb-12 font-fredoka scroll-mt-4"
      id="catalogo"
      aria-labelledby="catalogo-heading"
    >
      {/* BACKGROUND DIRETO NO CÃƒâ€œDIGO */}
      {/* OVERLAY PARA LEITURA (opcional, remova a classe bg-white/60 se quiser a imagem pura) */}

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        {/* CabeÃƒÂ§alho */}
        <div className="mb-5 rounded-3xl border border-white/90 bg-white/95 p-4 shadow-[0_8px_35px_rgba(88,28,135,0.07)] sm:p-5">
          <form action="/#catalogo" method="get" role="search" aria-label="Buscar materiais" className="flex min-h-14 overflow-hidden rounded-2xl border-2 border-purple-200 bg-white transition-shadow focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-100">
            <label htmlFor="busca-materiais" className="sr-only">Buscar materiais</label>
            <Search size={22} aria-hidden="true" className="ml-4 hidden shrink-0 self-center text-purple-400 sm:block" />
            <input
              id="busca-materiais"
              name="busca"
              type="search"
              defaultValue={textoBusca}
              key={textoBusca}
              placeholder="O que você quer ensinar hoje?"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-purple-950 outline-none placeholder:text-slate-500 sm:px-4 sm:text-base"
            />
            <button type="submit" aria-label="Buscar materiais no catálogo" className="flex shrink-0 items-center justify-center gap-2 bg-purple-700 px-4 font-semibold text-white transition-colors hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white sm:px-6">
              <Search size={20} aria-hidden="true" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div>
              <h1 id="catalogo-heading" className="text-xl font-semibold leading-tight tracking-tight text-purple-950 sm:text-2xl">
                {textoBusca ? `Resultados para “${textoBusca}”` : "Materiais para sua próxima aula"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">Escolha, compre e prepare sua próxima aula.</p>
            </div>

          {/* Filtros de Tipo */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <fieldset className="flex flex-wrap gap-2" aria-label="Filtrar por tipo de material">
            <legend className="sr-only">Tipo de material</legend>
            {[
              { id: 'todos', label: 'Todos', icon: <ShoppingCart size={16} /> },
              { id: 'digital', label: 'PDFs', icon: <FileText size={16} /> },
              { id: 'fisico', label: 'Físicos', icon: <Zap size={16} /> },
            ].map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                onClick={() => {
                  setCategoria(filtro.id as 'todos' | 'digital' | 'fisico');
                  setPaginaAtual(1);
                }}
                aria-pressed={categoria === filtro.id}
                className={`flex min-h-11 items-center cursor-pointer gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 ${categoria === filtro.id
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                  }`}
              >
                {filtro.icon}
                {filtro.label}
              </button>
            ))}
          </fieldset>
          {loaded && <p className="text-xs text-slate-500" role="status">{produtosFiltrados.length} {produtosFiltrados.length === 1 ? "material disponível" : "materiais disponíveis"}</p>}
          </div>
          </div>

          {/* Filtros de Tags */}
          {todasTags.length > 2 && <fieldset className="mt-3 flex flex-wrap gap-1.5" aria-label="Filtrar por tags">
            <legend className="sr-only">Tags de material</legend>
            {todasTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setTagAtiva(tag);
                  setPaginaAtual(1);
                }}
                aria-pressed={tagAtiva === tag}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${tagAtiva === tag
                  ? 'bg-pink-50 border-pink-200 text-pink-600 shadow-sm'
                  : 'bg-white/80 border-gray-100 text-gray-700 hover:border-gray-200'
                  }`}
              >
                {tag}
              </button>
            ))}
          </fieldset>}
        </div>

        {/* Grid de Produtos */}
        {!loaded ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-white/60 bg-white/80 p-3">
                <div className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                <div className="mt-3 h-4 w-4/5 rounded bg-gray-100 animate-pulse" />
                <div className="mt-2 h-3 w-2/5 rounded bg-gray-100 animate-pulse" />
                <div className="mt-3 h-9 rounded-xl bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : produtosExibidos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {produtosExibidos.map((produto, produtoIndex) => {
                const imagensDoProduto = getImagensDoProduto(produto);
                const imagemFinal = imagensDoProduto[0];

                return (
                  <div
                    key={produto.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-purple-100 bg-white p-3 shadow-[0_4px_20px_rgba(88,28,135,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(88,28,135,0.14)]"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-purple-100/40 to-transparent" />

                    {/* Product Type Tag */}
                    <span className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] shadow-sm ${produto.tipo === 'digital'
                      ? 'bg-blue-500 text-white shadow-blue-200/60'
                      : 'bg-orange-500 text-white shadow-orange-200/60'
                      }`}>
                      {produto.tipo === 'digital' ? 'PDF' : 'Físico'}
                    </span>

                    <button
                      type="button"
                      onClick={() => abrirModalProduto(produto, imagemFinal)}
                      aria-label={`Abrir detalhes de ${produto.nome}`}
                      className="relative mb-2 aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-white/60 bg-white shadow-inner"
                    >
                      <FallbackImage
                        src={imagemFinal}
                        alt={produto.nome}
                        width={300}
                        height={300}
                        loading={produtoIndex < 5 ? "eager" : "lazy"}
                        sizes="(max-width: 767px) 45vw, (max-width: 1023px) 30vw, (max-width: 1279px) 22vw, 18vw"
                        unoptimized={imagemFinal.startsWith("http://") || imagemFinal.startsWith("https://")}
                        className="h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>

                    {/* Open quick modal with product details */}
                    <button
                      type="button"
                      onClick={() => abrirModalProduto(produto, imagemFinal)}
                      className="flex flex-col flex-grow text-left cursor-pointer"
                      aria-label={`Abrir detalhes de ${produto.nome}`}
                    >
                      <div className="flex flex-col flex-1 px-0.5">
                        <h3 className="mb-3 min-h-11 text-[15px] font-black leading-tight text-gray-800 line-clamp-2 transition-colors group-hover:text-purple-700">
                          {produto.nome}
                        </h3>

                        <div className="flex flex-col mt-auto">
                          <span className="text-xl font-semibold text-purple-950 sm:text-2xl">
                            {formatCurrency(produto.preco)}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Action Buttons (Add to Cart / Buy Now) */}
                    {/* BOTÃƒâ€¢ES Ã¢â‚¬â€œ MOBILE LIMPO */}
                    <div className="mt-3 flex gap-2 border-t border-purple-100/80 pt-3">
                      {/* CARRINHO Ã¢â‚¬â€œ SOMENTE ÃƒÂCONE */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(produto)}
                        aria-label={`Adicionar ${produto.nome} ao carrinho`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-purple-200/70 bg-purple-100 text-purple-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-purple-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 md:h-11 md:w-11"
                      >
                        <ShoppingCart size={19}/>
                      </button>

                      {/* COMPRAR */}
                      <button
                        type="button"
                        onClick={() => handleBuyNow(produto)}
                        aria-label={`Comprar agora: ${produto.nome}`}
                        className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl bg-green-700 px-2 text-xs font-semibold text-white transition-colors hover:bg-green-800 active:bg-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 md:text-sm"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINAÃƒâ€¡ÃƒÆ’O */}
            {totalPaginas > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
                  disabled={paginaAtual === 1}
                  aria-label="Ir para a pÃƒÂ¡gina anterior"
                  className="p-2 rounded-xl bg-white border border-gray-100 text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPaginaAtual(num)}
                    aria-label={`Ir para a pÃƒÂ¡gina ${num}`}
                    aria-current={paginaAtual === num ? "page" : undefined}
                    className={`w-10 h-10 rounded-xl cursor-pointer  font-bold text-sm transition-all ${paginaAtual === num
                        ? "bg-purple-600 text-white shadow-md scale-110"
                        : "bg-white text-gray-700 border border-gray-100 hover:text-purple-600"
                      }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                  aria-label="Ir para a prÃƒÂ³xima pÃƒÂ¡gina"
                  className="p-2 rounded-xl bg-white border border-gray-100 text-purple-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-20 text-center relative z-10">
            <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <SearchX size={32} className="text-gray-200" />
            </div>
            <p className="font-bold text-xl text-gray-500">Nenhum material encontrado.</p>
            <button
              type="button"
              onClick={() => { setCategoria('todos'); setTagAtiva('Tudo'); setPaginaAtual(1); if (textoBusca) router.push('/#catalogo'); }}
              className="mt-3 text-purple-600 font-bold hover:underline text-sm cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {produtoSelecionado && (
        <dialog
          ref={modalRef}
          className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent px-4 py-6 backdrop:bg-slate-950/55 backdrop:backdrop-blur-md md:px-6 md:py-10"
          aria-modal="true"
          aria-label={`Detalhes de ${produtoSelecionado.nome}`}
          onCancel={(event) => {
            event.preventDefault();
            setProdutoSelecionado(null);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setProdutoSelecionado(null);
          }}
        >
          <div
            className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_35px_120px_rgba(15,23,42,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            {(() => {
              const imagensModal = getImagensDoProduto(produtoSelecionado);
              const imagemAtualModal = imagensModal[indiceFotoModal] || imagensModal[0];
              const destaques = produtoSelecionado.tipo === "digital"
                ? ["Acesso imediato", "Arquivo pronto para imprimir", "Compra 100% segura"]
                : ["Produção caprichada", "Envio com cuidado", "Compra 100% segura"];

              return (
                <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                  <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,#f5d0fe_0%,#ffffff_38%,#eef2ff_100%)] p-4 md:p-6">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 to-transparent" />
                    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 shadow-inner">
                      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${produtoSelecionado.tipo === "digital" ? "bg-blue-600 text-white" : "bg-orange-500 text-white"}`}>
                          {produtoSelecionado.tipo === "digital" ? "Digital" : "Físico"}
                        </span>
                        {produtoSelecionado.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={`${produtoSelecionado.id}-tag-${tag}`}
                            className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="relative h-[38vh] min-h-[300px] w-full md:h-[52vh]">
                        <FallbackImage
                          src={imagemAtualModal}
                          alt={produtoSelecionado.nome}
                          fill
                          sizes="(max-width: 767px) 90vw, 50vw"
                          unoptimized={imagemAtualModal.startsWith("http://") || imagemAtualModal.startsWith("https://")}
                          className="object-contain p-4 md:p-6"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setProdutoSelecionado(null)}
                        aria-label="Fechar modal"
                        className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-white"
                      >
                        <X size={18} />
                      </button>

                      {imagensModal.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleNavegarFotoModal("anterior")}
                            aria-label="Foto anterior"
                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-2xl border border-white/80 bg-white/90 p-3 text-slate-700 shadow-sm transition-colors hover:bg-white"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNavegarFotoModal("proxima")}
                            aria-label="Proxima foto"
                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-2xl border border-white/80 bg-white/90 p-3 text-slate-700 shadow-sm transition-colors hover:bg-white"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}
                    </div>

                    {imagensModal.length > 1 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                        {imagensModal.map((img, index) => (
                          <button
                            key={`${produtoSelecionado.id}-modal-thumb-${index}`}
                            type="button"
                            onClick={() => setIndiceFotoModal(index)}
                            aria-label={`Ver foto ${index + 1} de ${produtoSelecionado.nome}`}
                            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all ${
                              indiceFotoModal === index
                                ? "border-fuchsia-500 shadow-[0_10px_25px_rgba(217,70,239,0.22)]"
                                : "border-transparent opacity-80 hover:opacity-100"
                            }`}
                          >
                            <FallbackImage
                              src={img}
                              alt={`${produtoSelecionado.nome} miniatura ${index + 1}`}
                              fill
                              sizes="64px"
                              unoptimized={img.startsWith("http://") || img.startsWith("https://")}
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col p-5 md:p-7">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-fuchsia-600">
                          <Sparkles size={14} />
                          Detalhes do material
                        </p>
                        <h3 className="mt-3 text-2xl font-black leading-tight text-slate-900 md:text-[2rem]">
                          {produtoSelecionado.nome}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/produto/${produtoSelecionado.id}`)}
                        className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 transition-colors hover:bg-slate-100 md:inline-flex"
                      >
                        Ver página
                      </button>
                    </div>

                    <p className="text-sm leading-6 text-slate-600 md:text-[15px]">
                      {produtoSelecionado.descricao || "Material pronto para facilitar o aprendizado com praticidade."}
                    </p>

                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
                      {destaques.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#f5f3ff_100%)] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Investimento</span>
                          <div className="mt-2 text-3xl font-black text-slate-900">
                            {formatCurrency(produtoSelecionado.preco)}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm">
                          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Entrega</div>
                          <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-700">
                            {produtoSelecionado.tipo === "digital" ? <Download size={16} /> : <Package size={16} />}
                            {produtoSelecionado.tipo === "digital" ? "Imediata" : "Preparação rápida"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3">
                        <button
                          type="button"
                          onClick={() => handleBuyNow(produtoSelecionado)}
                          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-700 px-5 text-sm font-extrabold text-white shadow-lg shadow-green-200/70 transition-all hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl active:bg-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                        >
                          {produtoSelecionado.tipo === "digital" ? <Download size={18} /> : <Package size={18} />}
                          Comprar agora
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(produtoSelecionado)}
                          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-5 text-sm font-black text-fuchsia-800 transition-colors hover:bg-fuchsia-100"
                        >
                          <ShoppingCart size={18} />
                          Adicionar ao carrinho
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5">
                          <ShieldCheck size={14} className="text-emerald-600" />
                          Pagamento seguro
                        </span>
                        <button
                          type="button"
                          onClick={() => router.push(`/produto/${produtoSelecionado.id}`)}
                          className="inline-flex items-center rounded-full px-1 py-1 text-fuchsia-700 transition-colors hover:text-fuchsia-900 md:hidden"
                        >
                          Ver página completa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </dialog>
      )}



    </section>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-bold text-gray-400 text-sm">Preparando o catalogo...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
