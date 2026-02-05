"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, Heart, Star, BookOpen, 
  ArrowLeft, Sparkles, Award, CheckCircle2,
  Instagram, Mail
} from "lucide-react";

function SobreContent() {
  return (
    <div className="relative min-h-screen font-fredoka pb-24 overflow-hidden">
      
      {/* IMAGEM DE FUNDO (SALA DE AULA) COM TRATAMENTO DE UX */}
      <div className="fixed inset-0 -z-20">
        <Image
          src="/sala-de-aula.webp" // Certifique-se de ter essa imagem na pasta /public
          alt="Background Sala de Aula"
          fill
          className="object-cover opacity-100" // Opacidade baixa para não poluir
          priority
        />
        {/* Gradiente para suavizar a transição com suas cores Candy */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/80 to-pink-50/80 backdrop-blur-[2px]" />
      </div>

      {/* Navegação Superior */}
      <nav className="max-w-7xl mx-auto px-6 pt-7  lg:pt-10 relative z-10">
        <Link href="/" className="group inline-flex items-center gap-3 text-blue-500 hover:text-pink-500 transition-colors">
          <div className="w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm border border-blue-100 rounded-2xl flex items-center justify-center group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Voltar</span>
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* LADO ESQUERDO: Foto com Moldura Rosa BB */}
          <div className="lg:col-span-5 space-y-10">
            <div className="relative">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: -4 }}
                className="absolute inset-0 bg-pink-200/50 rounded-[4rem] -z-10"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 aspect-[4/5] rounded-[3.5rem] overflow-hidden border-[10px] border-white shadow-2xl shadow-pink-200/40"
              >
                <Image
                  src="/perfil.png"
                  alt="Rafaela Abreu"
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Badge Azul BB */}
              <motion.div 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute -right-4 -bottom-6 bg-white/90 backdrop-blur-md p-5 rounded-[2.5rem] shadow-xl border border-blue-100 flex items-center gap-4 z-20"
              >
                <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center text-white">
                  <Star fill="currentColor" size={18} />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-800 leading-none">100%</p>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Didático</p>
                </div>
              </motion.div>
            </div>

            {/* Redes Sociais */}
            <div className="flex gap-3">
              <Link href="#" className="flex-1 flex items-center justify-center gap-2 bg-pink-400 text-white px-6 py-4 rounded-3xl font-black text-sm shadow-lg shadow-pink-200 hover:bg-pink-500 transition-all">
                <Instagram size={20} /> Instagram
              </Link>
              <Link href="#" className="w-16 h-16 flex items-center justify-center bg-white border border-blue-100 text-blue-400 rounded-3xl hover:bg-blue-50 transition-all">
                <Mail size={24} />
              </Link>
            </div>
          </div>

          {/* LADO DIREITO: Conteúdo */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h1 className="text-5xl lg:text-7xl font-black text-fuchsia-400 leading-[0.9] tracking-tighter mb-6">
                Rafaela <br />
                <span className="text-pink-400">Abreu</span>
              </h1>
              
              <div className="bg-white/40 backdrop-blur-sm border border-white/60 p-8 rounded-[3rem] space-y-6">
                <p className="text-xl text-blue-600 font-bold italic">
                  &quot;Transformando o aprendizado em uma experiência mágica.&quot;
                </p>
                <p className="text-gray-600 leading-relaxed text-lg font-medium">
                  Como Neuropsicopedagoga, entendo que cada detalhe visual importa no processo de aprendizagem. Por isso, crio materiais que respeitam o desenvolvimento cognitivo sem perder o encanto da infância.
                </p>
              </div>
            </section>

            {/* Grid de Formação */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Pedagogia", color: "pink", icon: GraduationCap },
                { title: "NeuroPsicopedagogia", color: "blue", icon: Star },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white/80 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-all">
                  <div className={`w-12 h-12 bg-${item.color === 'pink' ? 'pink-100' : 'blue-100'} text-${item.color === 'pink' ? 'pink-500' : 'blue-500'} rounded-2xl flex items-center justify-center mb-4`}>
                    <item.icon size={24} />
                  </div>
                  <h4 className="font-black text-gray-900">{item.title}</h4>
                </div>
              ))}
            </div>

            {/* Selo de Garantia */}
            <div className="bg-blue-500 rounded-[3rem] p-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-blue-200">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Award size={32} />
              </div>
              <div>
                <h4 className="font-black text-xl">Conteúdo Validado</h4>
                <p className="text-blue-100 text-sm">Materiais testados e aprovados para desenvolvimento infantil.</p>
              </div>
              <CheckCircle2 className="ml-auto opacity-50" size={40} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SobrePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SobreContent />
    </Suspense>
  );
}