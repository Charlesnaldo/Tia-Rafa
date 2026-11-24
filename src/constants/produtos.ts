export type Produto = {
  id: string;
  nome: string;
  preco: number;
  imagem?: string;
  imagens?: string[];
  cor: string;
  descricao: string;
  tipo: "digital" | "fisico";
  downloadUrl?: string;
  arquivoLocal?: string;
  tags?: string[];
  inclui?: { id: string; nome: string }[];
  estrelas?: number;
  depoimento?: {
    autor: string;
    texto: string;
  };
};
