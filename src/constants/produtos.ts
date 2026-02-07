

export type Produto = {
  id: string;
  nome: string;
  preco: number; 
  imagem?: string;
  imagens?: string[];
  cor: string;
  descricao: string;
  tipo: 'digital' | 'fisico';
  downloadUrl?: string;
  tags?: string[];
  estrelas?: number;
  depoimento?: {
    autor: string;
    texto: string;
  };
};

export const PRODUTOS_LISTA: Record<string, Produto> = {
  "boas-vindas": {
    id: "boas-vindas",
    nome: "Painel de Boas Vindas",
    preco: 190,
    imagens: ["/embreve.jpg"],
    cor: "bg-purple-100",
    descricao: "O Painel de Boas-Vindas Infantil foi criado para encantar e espalhar alegria logo na chegada! Com cores vibrantes, alegres e cheias de vida, ele transforma qualquer ambiente em um espaço divertido e acolhedor para as crianças",
    tipo: 'digital',
    downloadUrl: '#',
    tags: ['Educação Infantil', 'Decoração'],
    estrelas: 5,
    depoimento: {
      autor: "Profª Juliana",
      texto: "Meus alunos amaram a recepção, as cores são vivas e o arquivo é super fácil de montar!"
    }
  },

  "historia-na-lata": {
    id: "historia-na-lata",
    nome: "🐰 Celebre a Páscoa com muita diversão e aprendizado!",
    preco: 3500,
    imagens: ["/embreve.jpg"],
    cor: "bg-blue-100",
    descricao: "A Páscoa na Tia Rafa já começou com muita fofura e aprendizado! Quer transformar o ensino sobre essa data especial em um momento mágico, lúdico e super prático? Conheça o nosso novo Arquivo na Lata de Páscoa!.",
    tipo: 'digital',
    downloadUrl: '#',
    tags: ['Educação Infantil', 'Ensino Fundamental'],
    estrelas: 4,
    depoimento: {
      autor: "Mãe do Theo",
      texto: "Gente, eu precisava vir aqui agradecer a Tia Rafa! Baixei o Arquivo na Lata de Páscoa e foi um sucesso absoluto na minha turma de alfabetização. As crianças ficaram hipnotizadas conforme eu ia tirando os cards da lata."
    }
  },

  "relogio-pedagogico-fisico": {
    id: "relogio-pedagogico-fisico",
    nome: "Relógio Pedagógico de Madeira",
    preco: 8990,
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
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
    imagens: ["/embreve.jpg"],
    cor: "bg-teal-100",
    descricao: "Aprendizagem ativa por meio de brincadeiras pedagógicas.",
    tipo: 'digital',
    tags: ['Brincadeiras', 'Lúdico'],
    estrelas: 5
  }
};