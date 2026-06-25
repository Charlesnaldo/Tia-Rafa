import type { Metadata } from "next";
import { Suspense } from "react";
import { Fredoka } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import HeaderMobile from "@/components/HeaderMobile";
import HeaderMobileTop from "@/components/HeaderMobileTop";
import Footer from "@/components/Footer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { CartProvider } from "@/context/CartContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
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
    <html lang="pt-br" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://acqmtxttsirgxhvrgdjn.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://acqmtxttsirgxhvrgdjn.supabase.co" />
      </head>
      <body className={`${fredoka.className} antialiased flex flex-col min-h-screen bg-white`}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <CartProvider>
          {/* HEADER DESKTOP */}
          <div className="hidden lg:block">
            <Header />
          </div>

          {/* LOGO MOBILE NO TOPO */}
          <div className="block lg:hidden">
            <HeaderMobileTop />
          </div>

          <main className="flex-grow">
            {children}
          </main>

          {/* MENU MOBILE FLUTUANTE */}
          <div className="block lg:hidden">
            <HeaderMobile />
          </div>

          <Footer />
          <WhatsAppFloatingButton />
        </CartProvider>
      </body>
    </html>
  );
}
