"use client";

import { motion } from "framer-motion";
import { Star, Quote, CheckCircle } from "lucide-react";

const depoimentos = [
  {
    nome: "Raniele",
    funcao: "Professora de Alfabetização",
    texto: "Os materiais da Tia Rafa transformaram minhas aulas! As crianças ficam encantadas com as cores e as atividades são super didáticas.",
    foto: "/testimonials/raniele.png",
  },
  {
    nome: "Alessadra",
    funcao: "Professora Ensino infantil",
    texto: "Comprei o kit Historia da Luva foi a melhor escolha. Meus alunos adoraram!",
    foto: "/testimonials/alessandra.png",
  },
  {
    nome: "Ludmila Madureira",
    funcao: "Pedagoga",
    texto: "Arquivos de altíssima qualidade. O PDF chega na hora e a organização dos temas facilita muito o nosso planejamento escolar.",
    foto: "/testimonials/lud.png",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white font-fredoka overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Título da Seção */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Quem usa, <span className="text-pink-500">ama e recomenda!</span>
          </h2>
          <p className="text-gray-500 text-lg font-medium">
            Mais de <span className="text-purple-600 font-bold">5.000 professoras</span> já transformaram suas salas de aula.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {depoimentos.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative bg-purple-50/50 p-8 rounded-[2.5rem] border border-purple-100 hover:shadow-xl transition-all group"
            >
              {/* Ícone de Aspas */}
              <div className="absolute -top-4 -right-2 bg-white p-3 rounded-full shadow-md text-purple-500 group-hover:rotate-12 transition-transform">
                <Quote size={24} fill="currentColor" opacity={0.2} />
              </div>

              {/* Estrelas */}
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-8 italic">
                "{item.texto}"
              </p>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={item.foto}
                    alt={item.nome}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                    <CheckCircle size={12} />
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 leading-none mb-1">
                    {item.nome}
                  </h4>
                  <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">
                    {item.funcao}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badge de Verificação Inferior */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-50 grayscale contrast-125">
             <div className="flex items-center gap-2 font-black text-gray-500 text-sm uppercase">
                <CheckCircle size={20} /> Compra 100% Segura
             </div>
             <div className="flex items-center gap-2 font-black text-gray-500 text-sm uppercase">
                <CheckCircle size={20} /> Material Validado
             </div>
             <div className="flex items-center gap-2 font-black text-gray-500 text-sm uppercase">
                <CheckCircle size={20} /> Acesso Instantâneo
             </div>
        </div>
      </div>
    </section>
  );
}