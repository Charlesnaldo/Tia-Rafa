import type { Metadata } from "next";

// Next replaces (does not merge) a parent's openGraph, so pages spread this base into their own.
export const siteTitle = "Tia Rafa - Materiais Didáticos";
export const siteDescription = "Materiais pedagógicos com muito amor e cor! Atividades em PDF prontas para imprimir e usar em sala de aula.";

export const baseOpenGraph = {
  type: "website",
  locale: "pt_BR",
  siteName: "Tia Rafa",
  title: siteTitle,
  description: siteDescription,
  images: [{ url: "/optimized/logo-mobile-480.png", width: 480, height: 480, alt: "Tia Rafa" }],
} satisfies NonNullable<Metadata["openGraph"]>;
