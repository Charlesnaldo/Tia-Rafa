// Free library shown on /atividades and sent by e-mail after the lead form.
export type FreeMaterial = {
  id: string;
  title: string;
  description: string;
  downloadLink: string;
  image: string;
  category: string;
};

export const FREE_MATERIALS: FreeMaterial[] = [
  {
    id: "alfabetizacao-nivel-1",
    title: "Alfabetização Inicial - Nível 1",
    description: "Folhas práticas para apresentar vogais, consoantes e primeiros encontros de letras.",
    downloadLink: "/materiais/alfabetiza%C3%A7%C3%A3o.pdf",
    image: "/img/boasvindas2.png",
    category: "Alfabetização",
  },
  {
    id: "boas-vindas-educacao-infantil",
    title: "Boas-vindas na Educação Infantil",
    description: "Material lúdico para acolher a turma no início do ano com atividades de integração.",
    downloadLink: "/materiais/BoasVindas.pdf",
    image: "/img/boasvindas2.png",
    category: "Educação Infantil",
  },
];
