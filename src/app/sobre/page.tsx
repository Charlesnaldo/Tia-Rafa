"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Heart, Star, BookOpen, ArrowLeft, Sparkles, Award, CheckCircle } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#FDF2F8] font-fredoka pb-20">

      {/* Navegação Superior */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <Link href="/" className="group inline-flex items-center gap-3 text-orange-500 font-black hover:text-orange-600 transition-all">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-orange-100 group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={20} />
          </div>
          VOLTAR AO INÍCIO
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {/* Card Principal com Efeito de Vidro */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(255,165,0,0.15)] overflow-hidden border border-white/80">
          <div className="flex flex-col lg:flex-row">

            {/* Lado Esquerdo - Visual Identity */}
            <div className="lg:w-2/5 bg-gradient-to-b from-orange-50 to-orange-100/50 p-12 flex flex-col items-center text-center relative overflow-hidden">

              {/* Elementos Decorativos de Fundo */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={120} className="text-orange-400" />
              </div>

              <div className="relative w-64 h-64 mb-8">
                {/* Moldura de Fundo (z-0) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-pink-400 rounded-[3.5rem] rotate-6 shadow-lg z-0"></div>

                {/* Container da Imagem (z-10) */}
                <div className="relative w-64 h-64 bg-white rounded-[3.5rem] overflow-hidden border-[6px] border-white shadow-2xl z-10 group">
                  <Image
                    src="/perfil.png"
                    alt="Rafaela Abreu"
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                    sizes="256px"
                  />
                </div>
              </div>

              <div className="relative z-10">
                <h1 className="text-4xl font-black text-amber-950 leading-[0.9] tracking-tighter mb-2">
                  Rafaela Abreu
                </h1>
                <div className="inline-block px-4 py-1.5 bg-white rounded-full shadow-sm">
                  <p className="text-orange-500 font-black text-xs uppercase tracking-widest">Professora & Mentora</p>
                </div>
              </div>

              {/* Stats Rápidos */}
              <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                <div className="bg-white/50 p-4 rounded-3xl border border-white">
                  <p className="text-2xl font-black text-orange-600 tracking-tighter">+5k</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Alunos</p>
                </div>
                <div className="bg-white/50 p-4 rounded-3xl border border-white">
                  <p className="text-2xl font-black text-pink-600 tracking-tighter">100%</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Lúdico</p>
                </div>
              </div>
            </div>

            {/* Lado Direito - Conteúdo */}
            <div className="lg:w-3/5 p-12 lg:p-16 bg-white">
              <header className="mb-12">
                <h2 className="flex items-center gap-2 text-sm font-black text-orange-400 uppercase tracking-[0.3em] mb-4">
                  <Award size={18} /> Excelência Acadêmica
                </h2>

                <div className="grid gap-6">
                  {/* Formação 1 */}
                  <div className="group flex gap-5 p-4 rounded-[2rem] hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 shadow-sm group-hover:rotate-6 transition-transform">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">Pedagogia</h3>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed">Formação base que sustenta todo o olhar acolhedor para a infância.</p>
                    </div>
                  </div>

                  {/* Formação 2 */}
                  <div className="group flex gap-5 p-4 rounded-[2rem] hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm group-hover:rotate-6 transition-transform">
                      <BookOpen size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">Gestão e Supervisão Escolar</h3>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed">Pós-Graduação com foco em organização e qualidade educacional.</p>
                    </div>
                  </div>

                  {/* Formação 3 */}
                  <div className="group flex gap-5 p-4 rounded-[2rem] hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100">
                    <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shrink-0 shadow-sm group-hover:rotate-6 transition-transform">
                      <Star size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">NeuroPsicopedagogia Clínica</h3>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed">Especialista em entender como o cérebro da criança aprende de verdade.</p>
                    </div>
                  </div>
                </div>
              </header>

              <section className="relative">
                <div className="absolute -left-6 top-0 text-orange-100">
                  <Heart size={40} fill="currentColor" />
                </div>
                <h2 className="text-sm font-black text-orange-400 uppercase tracking-[0.3em] mb-6">Manifesto de Afeto</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed text-lg font-medium italic">
                  <p>
                    "Olá! Eu sou a Rafaela. Acredito que a educação transforma vidas quando é feita com afeto e base científica."
                  </p>
                  <p className="not-italic text-base">
                    Com minha experiência em neuropsicopedagogia, crio materiais didáticos que respeitam o tempo de cada criança, estimulando as conexões neurais de forma divertida. Meu objetivo é facilitar a rotina de professores e pais com ferramentas validadas.
                  </p>
                </div>
              </section>

              {/* Selo de Autoridade */}
              <div className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[2.5rem] border border-emerald-100 flex items-center gap-5 relative group overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                  <CheckCircle size={100} className="text-emerald-600" />
                </div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm relative z-10">
                  👩‍🏫
                </div>
                <div className="relative z-10">
                  <p className="text-emerald-900 text-sm font-black leading-tight">
                    Conteúdo Validado e Seguro
                  </p>
                  <p className="text-emerald-700/70 text-xs font-bold mt-1">
                    Materiais criados com embasamento acadêmico e prática real em consultório e sala de aula.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}