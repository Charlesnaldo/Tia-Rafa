import React from "react";
import ActivityCard from "@/components/ActivityCard";

const AtividadesPage: React.FC = () => {
  const activities = [
    {
      id: 1,
      title: "Alfabetização Inicial - Nível 1",
      description: "Folhas práticas para apresentar vogais, consoantes e primeiros encontros de letras.",
      downloadLink: "/materiais/alfabetiza%C3%A7%C3%A3o.pdf",
      image: "/img/boasvindas2.png",
      category: "Alfabetização",
    },
    {
      id: 2,
      title: "Boas-vindas na Educação Infantil",
      description: "Material lúdico para acolher a turma no início do ano com atividades de integração.",
      downloadLink: "/materiais/BoasVindas.pdf",
      image: "/img/boasvindas2.png",
      category: "Educação Infantil",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#fdf4ff_100%)] px-4 py-10 lg:py-89">
      <div className="pointer-events-none absolute -left-20 top-28 h-52 w-52 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-60 w-60 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <section className="mb-10 rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
          <p className="mb-4 inline-flex rounded-full bg-blue-100 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-blue-700">
            Biblioteca gratuita
          </p>
          <h1 className="max-w-3xl text-3xl font-black leading-tight text-gray-900 md:text-5xl">
            Atividades prontas para baixar e aplicar com sua turma
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
            Materiais organizados para facilitar seu planejamento diário. Escolha a atividade, clique em baixar e use em sala de aula.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 md:max-w-xl md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center">
              <p className="text-2xl font-black text-blue-700">{activities.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">Atividades</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-black text-emerald-700">100%</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">Grátis</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-purple-100 bg-purple-50 p-3 text-center md:col-span-1">
              <p className="text-2xl font-black text-purple-700">1 clique</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-purple-600">Download rápido</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              title={activity.title}
              description={activity.description}
              downloadLink={activity.downloadLink}
              image={activity.image}
              category={activity.category}
            />
          ))}
        </section>
      </div>
    </div>
  );
};

export default AtividadesPage;
