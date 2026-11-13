import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import sapo from "../../public/optimized/testimonials/bocadosapo.webp";
import arvore from "../../public/optimized/testimonials/leoeaarvore.webp";
import aula2 from "../../public/optimized/testimonials/aula2.webp";
import aula3 from "../../public/optimized/testimonials/aula3.webp";
import aula4 from "../../public/optimized/testimonials/aula4.webp";
import aula5 from "../../public/optimized/testimonials/aula5.webp";
import aula6 from "../../public/optimized/testimonials/aula6.webp";

const images = [
  { src: sapo, alt: "Recurso pedagógico da boca do sapo usado em uma atividade infantil" },
  { src: arvore, alt: "Material ilustrado da história Léo e a árvore" },
  { src: aula2, alt: "Atividade pedagógica com materiais da Tia Rafa em sala de aula" },
  { src: aula3, alt: "Aplicação de um recurso didático da Tia Rafa com a turma" },
  { src: aula4, alt: "Registro de atividade lúdica com material pedagógico impresso" },
  { src: aula5, alt: "Proposta educativa com recursos coloridos da Tia Rafa" },
  { src: aula6, alt: "Material didático da Tia Rafa preparado para uma atividade infantil" },
];

export function ThreeDMarqueeDemo() {
  return (
    <div className="mx-auto my-10 max-w-8xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
      <ThreeDMarquee images={images} />
    </div>
  );
}
