"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, Heart, Star, BookOpen, 
  ArrowLeft, Sparkles, Award, CheckCircle2,
  Instagram, Mail, Download, Users, BookText,
  LucideProps // Importação necessária para a tipagem
} from "lucide-react";

// Tipagem corrigida para aceitar className e outras props do Lucide
interface FormationCard {
  title: string;
  description: string;
  icon: React.ComponentType<LucideProps>; 
  color: 'pink' | 'blue' | 'purple';
}

interface StatItem {
  value: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
}

function SobreContent() {
  const formations: FormationCard[] = [
    { 
      title: "Pedagogia", 
      description: "Especializada em educação infantil e alfabetização",
      icon: GraduationCap, 
      color: 'pink' 
    },
    { 
      title: "NeuroPsicopedagogia", 
      description: "Conhecimento em desenvolvimento cognitivo infantil",
      icon: Star, 
      color: 'blue' 
    },
    { 
      title: "Psicopedagogia Clínica", 
      description: "Atendimento personalizado para dificuldades de aprendizagem",
      icon: BookOpen, 
      color: 'purple' 
    },
  ];

  const stats: StatItem[] = [
    { value: "2.5k+", label: "Alunos Atendidos", icon: Users },
    { value: "150+", label: "Materiais Criados", icon: BookText },
    { value: "98%", label: "Satisfação", icon: Heart },
    { value: "15+", label: "Anos de Experiência", icon: Award },
  ];

  const socialLinks = [
    { 
      href: "https://instagram.com", 
      label: "Instagram", 
      icon: Instagram,
      color: "bg-gradient-to-r from-pink-500 to-purple-500",
      textColor: "text-white"
    },
    { 
      href: "mailto:contato@professora.com", 
      label: "Email", 
      icon: Mail,
      color: "bg-white border border-blue-100",
      textColor: "text-blue-500"
    },
    { 
      href: "#materiais", 
      label: "Materiais Gratuitos", 
      icon: Download,
      color: "bg-gradient-to-r from-blue-400 to-blue-600",
      textColor: "text-white"
    },
  ];

  return (
    <div className="relative min-h-screen font-fredoka pb-24 overflow-hidden bg-white">
      
      {/* Background */}
      <div className="fixed inset-0 -z-20">
        <Image
          src="/sala-de-aula.webp"
          alt="Sala de aula decorada"
          fill
          sizes="100vw"
          className="object-cover opacity-10 sm:opacity-15"
          priority
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/80 to-pink-50/80 backdrop-blur-[1px]" />
      </div>

      {/* Navegação */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="group inline-flex items-center gap-3 text-blue-500 hover:text-pink-500 transition-all"
            >
              <motion.div 
                whileHover={{ x: -5 }}
                className="w-10 h-10 bg-white backdrop-blur-md shadow-sm border border-blue-100 rounded-2xl flex items-center justify-center"
              >
                <ArrowLeft size={22} />
              </motion.div>
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                Voltar
              </span>
            </Link>
            
            <Link
              href="/#catalogo"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-pink-200 transition-all hover:scale-105 active:scale-95"
            >
              Ver Materiais
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-16 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Perfil */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-8 lg:space-y-10"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: [-2, 2, -2], scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-br from-pink-200/40 via-transparent to-blue-200/40 rounded-[4rem] -z-10 blur-xl"
              />
              
              <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden border-[12px] border-white shadow-2xl shadow-pink-200/30">
                <Image
                  src="/perfil1.png"
                  alt="Rafaela Abreu"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top"
                  priority
                />
              </div>

              <div className="absolute -right-4 -bottom-6 bg-white/90 backdrop-blur-md p-5 rounded-[2.5rem] shadow-xl border border-blue-100 flex items-center gap-4 z-20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Star fill="currentColor" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-800 leading-none">100%</p>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Didático</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl flex items-center justify-center">
                      <stat.icon size={18} className="text-pink-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-800 leading-none">{stat.value}</p>
                      <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-3 ${link.color} ${link.textColor} px-6 py-4 rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-95`}>
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Conteúdo */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-10 lg:space-y-12"
          >
            <section className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-purple-400">
                  Rafaela Abreu
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 font-medium mt-4">
                  Neuropsicopedagoga & Criadora de Materiais Educativos
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-md border border-white/80 p-6 sm:p-8 rounded-[2.5rem] space-y-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xl text-blue-600 font-bold italic leading-relaxed">
                      "Transformando o aprendizado em uma experiência mágica e significativa."
                    </p>
                    <p className="text-gray-600 leading-relaxed mt-4 text-lg">
                      Com mais de 15 anos de experiência em educação infantil, crio materiais que unem fundamentos neurocientíficos com design encantador.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Formação e Especializações</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formations.map((item, index) => (
                  <div key={index} className="p-6 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-sm transition-all hover:shadow-md">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color === 'pink' ? 'from-pink-100 to-pink-50' : item.color === 'blue' ? 'from-blue-100 to-blue-50' : 'from-purple-100 to-purple-50'} rounded-2xl flex items-center justify-center mb-4`}>
                      <item.icon size={28} className={item.color === 'pink' ? 'text-pink-500' : item.color === 'blue' ? 'text-blue-500' : 'text-purple-500'} />
                    </div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0"><Award size={36} /></div>
                <div className="flex-1">
                  <h4 className="font-black text-xl md:text-2xl mb-2">Conteúdo Validado Cientificamente</h4>
                  <p className="text-blue-100 text-sm">Todos os materiais são baseados em evidências científicas e testados em sala de aula.</p>
                </div>
                <CheckCircle2 className="opacity-70 hidden md:block" size={48} />
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/materiais"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group"
              >
                <BookOpen size={24} />
                Explorar Materiais Educativos
                <ArrowLeft size={24} className="rotate-180 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function SobrePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" /></div>}>
      <SobreContent />
    </Suspense>
  );
}