import type { Metadata } from "next";
import { Fredoka } from "next/font/google"; // Importando a Fredoka
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Configuração da fonte infantil
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka", // Criamos uma variável CSS
});

export const metadata: Metadata = {
  title: "Tia Rafa - Materiais Didáticos",
  description: "Materiais pedagógicos com muito amor e cor!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className="scroll-smooth">
      {/* Aplicamos a classe da Fredoka e a fonte sans padrão do Tailwind vira ela */}
      <body className={`${fredoka.className} antialiased flex flex-col min-h-screen bg-white`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}