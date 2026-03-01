"use client";

import { useState, Suspense, useMemo, useEffect } from "react";
import { ShoppingCart, FileText, SearchX, Zap, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation"; // Import useRouter
import { type Produto } from "@/constants/produtos"; // Import Produto type
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext"; // Import useCart
import { useProductsCatalog } from "@/lib/products/useProductsCatalog";

function CatalogContent() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca")?.toLowerCase() || "";
  const router = useRouter(); // Initialize useRouter
  const { addToCart } = useCart(); // Initialize useCart
  const { productsArray: produtosArray, loaded } = useProductsCatalog();

  // CONFIGURAÃƒâ€¡ÃƒÆ’O DO FUNDO
  const bgImage = "/background.webp";

  const [categoria, setCategoria] = useState<'todos' | 'digital' | 'fisico'>('todos');
  const [tagAtiva, setTagAtiva] = useState<string>('Tudo');
  const [imagemAtivaPorProduto, setImagemAtivaPorProduto] = useState<Record<string, string>>({});
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [indiceFotoModal, setIndiceFotoModal] = useState(0);

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
      const matchesBusca = produto.nome.toLowerCase().includes(busca);
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

  const handleSelecionarImagem = (produtoId: string, imagem: string) => {
    setImagemAtivaPorProduto((prev) => ({ ...prev, [produtoId]: imagem }));
  };

  const handleNavegarMiniatura = (produto: Produto, direcao: "anterior" | "proxima") => {
    const imagensDoProduto = getImagensDoProduto(produto);
    const imagemAtual = imagemAtivaPorProduto[produto.id] || imagensDoProduto[0];
    const indiceAtual = Math.max(imagensDoProduto.indexOf(imagemAtual), 0);
    const proximoIndice = direcao === "proxima"
      ? (indiceAtual + 1) % imagensDoProduto.length
      : (indiceAtual - 1 + imagensDoProduto.length) % imagensDoProduto.length;
    handleSelecionarImagem(produto.id, imagensDoProduto[proximoIndice]);
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
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProdutoSelecionado(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <section
      className="relative py-16 font-fredoka scroll-mt-10 overflow-hidden"
      id="catalogo"
      aria-labelledby="catalogo-heading"
    >
      {/* BACKGROUND DIRETO NO CÃƒâ€œDIGO */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      {/* OVERLAY PARA LEITURA (opcional, remova a classe bg-white/60 se quiser a imagem pura) */}
      <div className="absolute inset-0 -z-10 bg-white/92 backdrop-blur-[2px]" />

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        {/* CabeÃƒÂ§alho */}
        <div className="text-center mb-5">
          <h2 id="catalogo-heading" className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
            {busca ? (
              <span className="text-gray-900 bg-white/80 px-4 py-1 rounded-2xl">Ã°Å¸â€Â Resultados para: {busca}</span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                Nosso Catálogo Mágico
              </span>
            )}
          </h2>

          {/* Filtros de Tipo */}
          <fieldset className="flex flex-wrap justify-center gap-2 mb-6" aria-label="Filtrar por tipo de material">
            <legend className="sr-only">Tipo de material</legend>
            {[
              { id: 'todos', label: 'Todos', icon: <ShoppingCart size={14} /> },
              { id: 'digital', label: 'Digital', icon: <FileText size={14} /> },
              { id: 'fisico', label: 'Físico', icon: <Zap size={14} /> },
            ].map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                onClick={() => {
                  setCategoria(filtro.id as 'todos' | 'digital' | 'fisico');
                  setPaginaAtual(1);
                }}
                aria-pressed={categoria === filtro.id}
                className={`flex items-center cursor-pointer gap-1 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${categoria === filtro.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
                  : 'bg-white/90 text-gray-700 hover:bg-white hover:text-gray-800 border border-gray-100'
                  }`}
              >
                {filtro.icon}
                {filtro.label}
              </button>
            ))}
          </fieldset>

          {/* Filtros de Tags */}
          <fieldset className="flex flex-wrap justify-center gap-1.5 max-w-4xl mx-auto mb-6" aria-label="Filtrar por tags">
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
          </fieldset>
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
              {produtosExibidos.map((produto) => {
                const imagensDoProduto = getImagensDoProduto(produto);
                const imagemFinal = imagemAtivaPorProduto[produto.id] || imagensDoProduto[0];

                return (
                  <div
                    key={produto.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-white/70 bg-white/95 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_40px_rgba(147,51,234,0.16)]"
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
                      className={`relative mb-2 aspect-square w-full overflow-hidden rounded-2xl border border-white/60 shadow-inner ${produto.cor} cursor-pointer`}
                    >
                      <Image
                        src={imagemFinal}
                        alt={produto.nome}
                        width={300}
                        height={300}
                        unoptimized={imagemFinal.startsWith("http://") || imagemFinal.startsWith("https://")}
                        className="h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>

                    {imagensDoProduto.length > 1 && (
                      <div className="mb-3">
                        <div className="mb-1.5 flex items-center justify-between md:hidden">
                          <button
                            type="button"
                            onClick={() => handleNavegarMiniatura(produto, "anterior")}
                            aria-label={`Miniatura anterior de ${produto.nome}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-200 bg-white text-purple-700 transition-colors hover:bg-purple-50"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNavegarMiniatura(produto, "proxima")}
                            aria-label={`Próxima miniatura de ${produto.nome}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-200 bg-white text-purple-700 transition-colors hover:bg-purple-50"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>

                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {imagensDoProduto.slice(0, 5).map((img, index) => (
                            <button
                              key={`${produto.id}-thumb-${index}`}
                              type="button"
                              onClick={() => handleSelecionarImagem(produto.id, img)}
                              aria-label={`Ver foto ${index + 1} de ${produto.nome}`}
                              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                                imagemFinal === img
                                  ? "border-purple-500 shadow-sm"
                                  : "border-transparent opacity-80 hover:opacity-100"
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`${produto.nome} miniatura ${index + 1}`}
                                fill
                                sizes="48px"
                                unoptimized={img.startsWith("http://") || img.startsWith("https://")}
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Open quick modal with product details */}
                    <button
                      type="button"
                      onClick={() => abrirModalProduto(produto, imagemFinal)}
                      className="flex flex-col flex-grow text-left cursor-pointer"
                      aria-label={`Abrir detalhes de ${produto.nome}`}
                    >
                      <div className="flex flex-col flex-1 px-0.5">
                        <div className="mb-2 flex min-h-5 flex-wrap gap-1.5">
                          {produto.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="mb-3 min-h-11 text-[15px] font-black leading-tight text-gray-800 line-clamp-2 transition-colors group-hover:text-purple-700">
                          {produto.nome}
                        </h3>

                        <div className="flex flex-col mt-auto">
                          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Investimento</span>
                          <span className="text-[1.15rem] font-black text-gray-900 transition-colors group-hover:text-purple-600">
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
                        className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-[11px] font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 md:h-11 md:text-xs"
                      >
                        <Download size={19} />
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
            <p className="font-bold text-xl text-gray-500">Nenhum material mÃƒÂ¡gico encontrado.</p>
            <button
              type="button"
              onClick={() => { setCategoria('todos'); setTagAtiva('Tudo'); setPaginaAtual(1); }}
              className="mt-3 text-purple-600 font-bold hover:underline text-sm cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {produtoSelecionado && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 backdrop-blur-md px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes de ${produtoSelecionado.nome}`}
          onClick={() => setProdutoSelecionado(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {(() => {
              const imagensModal = getImagensDoProduto(produtoSelecionado);
              const imagemAtualModal = imagensModal[indiceFotoModal] || imagensModal[0];
              return (
                <>
                  <div className="relative mb-4 overflow-hidden rounded-2xl border border-purple-100 bg-gray-50">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={imagemAtualModal}
                        alt={produtoSelecionado.nome}
                        fill
                        unoptimized={imagemAtualModal.startsWith("http://") || imagemAtualModal.startsWith("https://")}
                        className="object-contain p-3"
                      />
                    </div>

                    {imagensModal.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleNavegarFotoModal("anterior")}
                          aria-label="Foto anterior"
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/90 p-2 text-gray-900 transition-colors hover:bg-white"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNavegarFotoModal("proxima")}
                          aria-label="Proxima foto"
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/90 p-2 text-gray-900 transition-colors hover:bg-white"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  {imagensModal.length > 1 && (
                    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                      {imagensModal.map((img, index) => (
                        <button
                          key={`${produtoSelecionado.id}-modal-thumb-${index}`}
                          type="button"
                          onClick={() => setIndiceFotoModal(index)}
                          aria-label={`Ver foto ${index + 1} de ${produtoSelecionado.nome}`}
                          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                            indiceFotoModal === index
                              ? "border-purple-500 shadow-sm"
                              : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${produtoSelecionado.nome} miniatura ${index + 1}`}
                            fill
                            sizes="56px"
                            unoptimized={img.startsWith("http://") || img.startsWith("https://")}
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-purple-500">
              {produtoSelecionado.tipo === "digital" ? "Arquivo Digital" : "Produto Fisico"}
            </p>
            <h3 className="mt-1 text-2xl font-black leading-tight text-gray-900">{produtoSelecionado.nome}</h3>
            <p className="mt-3 text-sm text-gray-600">
              {produtoSelecionado.descricao || "Material pronto para facilitar o aprendizado com praticidade."}
            </p>
            <div className="mt-3 text-xl font-black text-gray-900">{formatCurrency(produtoSelecionado.preco)}</div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddToCart(produtoSelecionado)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-purple-200/70 bg-purple-100 px-4 text-sm font-black text-purple-800 transition-all hover:bg-purple-200"
              >
                <ShoppingCart size={18} />
                Adicionar ao carrinho
              </button>
              <button
                type="button"
                onClick={() => handleBuyNow(produtoSelecionado)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 text-sm font-extrabold text-white transition-all hover:shadow-lg"
              >
                <Download size={18} />
                Comprar
              </button>
              <button
                type="button"
                onClick={() => setProdutoSelecionado(null)}
                className="ml-auto rounded-xl bg-purple-600 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-purple-700"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}



    </section>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-bold text-gray-400 text-sm">Preparando o catÃƒÂ¡logo...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
