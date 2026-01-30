import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import HeaderMobile from "@/components/HeaderMobile"; // Certifique-se que este arquivo existe
import Footer from "@/components/Footer";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
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
      <body className={`${fredoka.className} antialiased flex flex-col min-h-screen bg-white`}>
        
        {/* HEADER DESKTOP: hidden por padrão, block em telas lg (1024px+) */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* HEADER MOBILE: block por padrão, hidden em telas lg */}
        <div className="block lg:hidden">
          <HeaderMobile />
        </div>

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}