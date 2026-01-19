import { ShoppingCart, CreditCard, MailOpen, FileCheck } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <ShoppingCart size={32} />,
      title: "Escolha",
      desc: "Selecione seus materiais favoritos.",
      color: "bg-purple-100 text-purple-600",
      dot: "bg-purple-400"
    },
    {
      icon: <CreditCard size={32} />, 
      title: "Pagamento",
      desc: "Pague com PIX ou Cartão com segurança.",
      color: "bg-blue-100 text-blue-600",
      dot: "bg-blue-400"
    },
    {
      icon: <MailOpen size={32} />,
      title: "E-mail",
      desc: "O link de acesso chega no seu e-mail.",
      color: "bg-pink-100 text-pink-600",
      dot: "bg-pink-400"
    },
    {
      icon: <FileCheck size={32} />,
      title: "Imprima",
      desc: "Baixe o PDF e comece a diversão!",
      color: "bg-green-100 text-green-600",
      dot: "bg-green-400"
    },
  ];

  return (
    <section className="py-24 bg-white font-fredoka overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Título da Seção */}
        <div className="text-center mb-16">
          <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
            É muito simples!
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-6">
            Como você recebe <br /> 
            <span className="text-purple-600">seus materiais?</span>
          </h2>
        </div>

        {/* Grid de Passos */}
        <div className="relative">
          {/* Linha pontilhada decorativa (Desktop) */}
          <div className="hidden lg:block absolute top-1/4 left-0 w-full h-0.5 border-t-4 border-dashed border-gray-100 -z-10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                {/* Círculo do Ícone */}
                <div className={`w-24 h-24 ${step.color} rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative`}>
                  {step.icon}
                  {/* Número do Passo */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center text-xs font-black text-gray-400 shadow-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Texto */}
                <h3 className="text-2xl font-black text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed px-4">
                  {step.desc}
                </p>

                {/* Pontinho colorido de conexão */}
                <div className={`mt-6 w-3 h-3 ${step.dot} rounded-full hidden lg:block`} />
              </div>
            ))}
          </div>
        </div>

        {/* Card de Aviso importante */}
        <div className="mt-20 bg-purple-100 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between border-2 border-dashed border-purple-400">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <span className="text-4xl">🚀</span>
            </div>
            <div>
              <h4 className="text-xl font-black text-amber-900">Acesso Vitalício</h4>
              <p className="text-amber-800/70 font-medium">O material é seu para sempre. Imprima quantas vezes quiser!</p>
            </div>
          </div>
          <button className="bg-purple-400 hover:bg-purple-600 text-white font-black px-10 py-4 rounded-full shadow-lg transition-transform active:scale-95">
            VER CATÁLOGO
          </button>
        </div>

      </div>
    </section>
  );
}