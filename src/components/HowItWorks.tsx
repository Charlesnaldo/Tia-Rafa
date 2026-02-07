"use client";

import { ShoppingCart, CreditCard, MailOpen, FileCheck, ArrowRight, Sparkles, Download, Printer, ShieldCheck, Smartphone } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <ShoppingCart size={32} />,
      title: "Escolha",
      desc: "Navegue por nosso catálogo lúdico e selecione os materiais que mais encantam seus pequenos.",
      color: "from-purple-500 to-indigo-500",
      lightColor: "bg-purple-50",
      shadow: "shadow-purple-200",
      cardBg: "bg-white" 
    },
    {
      icon: <CreditCard size={32} />,
      title: "Pagamento",
      desc: "Finalize sua compra com total segurança via PIX ou Cartão de Crédito em segundos.",
      color: "from-blue-500 to-cyan-500",
      lightColor: "bg-blue-50",
      shadow: "shadow-blue-200",
      cardBg: "bg-white"
    },
    {
      icon: <MailOpen size={32} />,
      title: "E-mail",
      desc: "Assim que confirmado, você recebe um link mágico diretamente na sua caixa de entrada.",
      color: "from-pink-500 to-rose-500",
      lightColor: "bg-pink-50",
      shadow: "shadow-pink-200",
      cardBg: "bg-white"
    },
    {
      icon: <FileCheck size={32} />,
      title: "Imprima",
      desc: "Baixe o PDF em alta qualidade, imprima em casa e comece a diversão educativa!",
      color: "from-green-500 to-emerald-500",
      lightColor: "bg-green-50",
      shadow: "shadow-green-200",
      cardBg: "bg-white"
    },
  ];

  const features = [
    { icon: <Download size={20} />, text: "Download Imediato", color: "text-purple-600" },
    { icon: <Printer size={20} />, text: "Impressão Ilimitada", color: "text-blue-600" },
    { icon: <ShieldCheck size={20} />, text: "Garantia de 7 Dias", color: "text-green-600" },
    { icon: <Smartphone size={20} />, text: "Acesso Mobile", color: "text-pink-600" },
  ];

  return (
    <section className="py-24 font-fredoka overflow-hidden relative bg-white" id="como-funciona">
      
      
    
<div className="absolute top-0 left-0 w-full leading-[0] z-20">
  <svg 
    viewBox="0 0 1440 320" 
    preserveAspectRatio="none" 
    className="relative block w-full h-20 md:h-32 fill-white"
  >
    <path 
      d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
    ></path>
  </svg>
</div>
      
      
<div className="absolute top-0 left-0 w-full leading-[0] z-0 rotate-180">
  <svg 
    viewBox="0 0 1200 120" 
    preserveAspectRatio="none" 
    className="relative block w-full h-16 md:h-24 fill-white opacity-50"
  >
    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
  </svg>
</div>

      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25" 
        style={{ backgroundImage: "url('/background2.jpg')" }}
      />

     
       <div className="absolute bottom-0 left-0 w-full leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 md:h-24 fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40 translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-100 px-5 py-2 rounded-full shadow-sm mb-6">
            <Sparkles className="text-orange-400" size={18} />
            <span className="text-orange-600 text-xs font-black uppercase tracking-[0.2em]">
              Passo a Passo
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-12">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">Como você recebe </span>
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
              seus materiais?
            </span>
          </h2>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-50 shadow-sm">
                <div className={feature.color}>{feature.icon}</div>
                <span className="text-sm font-bold text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className={`${step.cardBg} p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl transition-all duration-500 relative z-10 h-full flex flex-col items-center text-center hover:-translate-y-4`}>

                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mb-8 shadow-lg ${step.shadow} group-hover:rotate-6 transition-transform duration-500`}>
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -top-12 -left-4 text-8xl font-black text-gray-50 -z-10 select-none">
                    0{index + 1}
                  </span>
                  <h3 className="text-2xl font-black text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              {index !== steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-6 z-20 translate-y-[-50%] text-gray-200">
                  <ArrowRight size={32} strokeWidth={3} className="animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        
        <div className="mt-24 mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-[3.5rem] blur-xl opacity-20 -rotate-1 scale-105" />
          <div className="relative bg-white rounded-[3.5rem] p-8 md:p-14 border border-purple-100 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center flex-shrink-0">
                <span className="text-5xl animate-bounce">🎁</span>
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-black text-purple-600 mb-2">Acesso Vitalício Garantido</h4>
                <p className="text-gray-500 text-lg font-medium">O material é seu para sempre! Salve na nuvem, no computador ou imprima sempre que precisar.</p>
              </div>
            </div>

            <button className="w-full lg:w-auto bg-purple-900 hover:bg-purple-600 text-white font-black px-8 py-3 rounded-3xl shadow-xl transition-all active:scale-95 group flex items-center justify-center gap-3">
              EXPLORAR MATERIAIS
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}