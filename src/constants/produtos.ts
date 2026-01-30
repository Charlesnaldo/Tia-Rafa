

export type Produto = {
  id: string;
  nome: string;
  preco: number; // Preço em centavos
  imagem: string;
  cor: string;
  descricao: string;
  tipo: 'digital' | 'fisico';
  downloadUrl?: string; // Para produtos digitais
  tags?: string[]; // Ex: ['Alfabetização', '4-6 anos']
  estrelas?: number;
  depoimento?: {
    autor: string;
    texto: string;
  };
};

export const PRODUTOS_LISTA: Record<string, Produto> = {
  "volta-as-aulas": {
    id: "volta-as-aulas",
    nome: "Painel Volta às Aulas",
    preco: 790,
    imagem: "/perfil.png",
    cor: "bg-purple-100",
    descricao: "Um painel mágico para recepcionar os seus alunos com muito carinho e cor!",
    tipo: 'digital',
    downloadUrl: '#',
    tags: ['Educação Infantil', 'Decoração'],
    estrelas: 5,
    depoimento: {
      autor: "Profª Juliana",
      texto: "Meus alunos amaram a recepção, as cores são vivas e o arquivo é super fácil de montar!"
    }
  },

  "matematica-ludica": {
    id: "matematica-ludica",
    nome: "Matemática Lúdica",
    preco: 3500,
    imagem: "/perfil.png",
    cor: "bg-blue-100",
    descricao: "Aprender números nunca foi tão divertido. Jogos e atividades práticas.",
    tipo: 'digital',
    downloadUrl: '#',
    tags: ['Matemática', 'Ensino Fundamental'],
    estrelas: 4,
    depoimento: {
      autor: "Mãe do Theo",
      texto: "Finalmente meu filho se interessou pelos números. O material é muito visual e prático."
    }
  },

  "relogio-pedagogico-fisico": {
    id: "relogio-pedagogico-fisico",
    nome: "Relógio Pedagógico de Madeira",
    preco: 8990,
    imagem: "/perfil.png",
    cor: "bg-yellow-100",
    descricao: "Recurso físico em madeira reflorestada para ensinar as horas de forma prática.",
    tipo: 'fisico',
    tags: ['Madeira', 'Recurso Físico', '7-9 anos'],
    estrelas: 5
  },

  "kit-alfabetizacao-pronto": {
    id: "kit-alfabetizacao-pronto",
    nome: "Kit Alfabetização (Pronto para Uso)",
    preco: 12900,
    imagem: "/perfil.png",
    cor: "bg-pink-100",
    descricao: "Material impresso, plastificado e enviado via Correios até sua casa.",
    tipo: 'fisico',
    tags: ['Alfabetização', 'Pronto para Uso'],
    estrelas: 5,
    depoimento: {
      autor: "Profª Carla",
      texto: "A qualidade da plastificação é incrível. Economizei horas de trabalho!"
    }
  },

  "alfabetizacao-magica": {
    id: "alfabetizacao-magica",
    nome: "Alfabetização Mágica",
    preco: 2790,
    imagem: "/perfil.png",
    cor: "bg-pink-100",
    descricao: "O guia completo para transformar a leitura num momento de magia.",
    tipo: 'digital',
    tags: ['Alfabetização', '5-7 anos'],
    estrelas: 5
  },

  "alfabetizacao-inicial": {
    id: "alfabetizacao-inicial",
    nome: "Alfabetização Inicial",
    preco: 2490,
    imagem: "/perfil.png",
    cor: "bg-pink-100",
    descricao: "Atividades pensadas para os primeiros passos no mundo da leitura.",
    tipo: 'digital',
    tags: ['Alfabetização', '4-5 anos'],
    estrelas: 4
  },

  "leitura-divertida": {
    id: "leitura-divertida",
    nome: "Leitura Divertida",
    preco: 2290,
    imagem: "/perfil.png",
    cor: "bg-green-100",
    descricao: "Estimule o hábito da leitura com histórias e desafios envolventes.",
    tipo: 'digital',
    tags: ['Leitura', 'Ensino Fundamental'],
    estrelas: 5
  },

  "numeros-e-formas": {
    id: "numeros-e-formas",
    nome: "Números e Formas",
    preco: 1990,
    imagem: "/perfil.png",
    cor: "bg-yellow-100",
    descricao: "Aprendizado visual para reconhecer números e formas geométricas.",
    tipo: 'digital',
    tags: ['Matemática', '3-5 anos'],
    estrelas: 4
  },

  "coordenacao-motora": {
    id: "coordenacao-motora",
    nome: "Coordenação Motora",
    preco: 2190,
    imagem: "/perfil.png",
    cor: "bg-orange-100",
    descricao: "Atividades para desenvolver coordenação motora fina e ampla.",
    tipo: 'digital',
    tags: ['Psicomotricidade', 'Infantil'],
    estrelas: 5
  },

  "cores-e-sentidos": {
    id: "cores-e-sentidos",
    nome: "Cores e Sentidos",
    preco: 1890,
    imagem: "/perfil.png",
    cor: "bg-red-100",
    descricao: "Explorando cores, emoções e sentidos de forma lúdica.",
    tipo: 'digital',
    tags: ['Sensorial', 'Infantil'],
    estrelas: 4
  },

  "educacao-infantil-criativa": {
    id: "educacao-infantil-criativa",
    nome: "Educação Infantil Criativa",
    preco: 2990,
    imagem: "/perfil.png",
    cor: "bg-indigo-100",
    descricao: "Material criativo para enriquecer as aulas da educação infantil.",
    tipo: 'digital',
    tags: ['Criatividade', 'Professores'],
    estrelas: 5
  },

  "brincar-e-aprender": {
    id: "brincar-e-aprender",
    nome: "Brincar e Aprender",
    preco: 2690,
    imagem: "/perfil.png",
    cor: "bg-teal-100",
    descricao: "Aprendizagem ativa por meio de brincadeiras pedagógicas.",
    tipo: 'digital',
    tags: ['Brincadeiras', 'Lúdico'],
    estrelas: 5
  }
};