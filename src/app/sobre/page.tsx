"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Heart, Star, BookOpen, ArrowLeft } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-[#FFF5F0] font-fredoka pb-20">
      {/* Botão Voltar */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-600 font-black hover:gap-4 transition-all">
          <ArrowLeft size={20} /> VOLTAR PARA O INÍCIO
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <div className="bg-white rounded-[3rem] shadow-xl shadow-orange-200/20 overflow-hidden border border-orange-100">
          <div className="flex flex-col md:flex-row">
            
            {/* Lado Esquerdo - Foto e Título */}
            <div className="md:w-1/3 bg-orange-50 p-12 flex flex-col items-center text-center">
              <div className="relative w-48 h-48 mb-6">
                {/* Moldura Decorativa */}
                <div className="absolute inset-0 bg-orange-200 rounded-[2.5rem] rotate-6"></div>
                <div className="absolute inset-0 bg-white rounded-[2.5rem] overflow-hidden border-4 border-white shadow-inner relative z-10">
                  {/* Substitua pela sua foto real em public/rafaela.jpg */}
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-400">
                    FOTO
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl font-black text-amber-900 leading-tight">
                Rafaela Abreu <br /> dos Santos
              </h1>
              <p className="text-orange-500 font-bold mt-2">Professora & Mentora</p>
              
              <div className="mt-8 flex gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-pink-400 shadow-sm">
                  <Heart size={16} fill="currentColor" />
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-yellow-500 shadow-sm">
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Lado Direito - Currículo e História */}
            <div className="md:w-2/3 p-12">
              <section className="mb-10">
                <h2 className="text-sm font-black text-orange-400 uppercase tracking-[0.2em] mb-4">Minha Formação</h2>
                <div className="space-y-6">
                  {/* Item 1 */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800">Pedagogia</h3>
                      <p className="text-gray-500 text-sm font-medium">Graduação Base</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800">Gestão, Coordenação e Supervisão Escolar</h3>
                      <p className="text-gray-500 text-sm font-medium">Pós-Graduação Especialista</p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shrink-0">
                      <Star size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800">NeuroPsicopedagogia Clínica e Institucional</h3>
                      <p className="text-gray-500 text-sm font-medium">Pós-Graduação Especialista</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-sm font-black text-orange-400 uppercase tracking-[0.2em] mb-4">Um pouco sobre mim</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Olá! Eu sou a Rafaela. Acredito que a educação transforma vidas quando é feita com afeto e base científica. 
                  Com minha experiência em neuropsicopedagogia, crio materiais didáticos que respeitam o tempo de cada criança, 
                  estimulando as conexões neurais de forma lúdica e divertida. Meu objetivo é facilitar a rotina de professores 
                  e pais, entregando ferramentas que realmente funcionam na prática escolar.
                </p>
              </section>

              {/* Selo de Confiança */}
              <div className="mt-12 p-6 bg-green-50 rounded-3xl border-2 border-dashed border-green-200 flex items-center gap-4">
                <span className="text-3xl">👩‍🏫</span>
                <p className="text-green-800 text-xs font-bold leading-tight">
                  Conteúdo validado por profissional com sólida formação acadêmica e prática em sala de aula.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}