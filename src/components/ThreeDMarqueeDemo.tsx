"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

export function ThreeDMarqueeDemo() {
  const images = [
    "/testimonials/bocadosapo.webp",
    "/testimonials/leoeaarvore.webp",
    "/testimonials/aula2.webp",
    "/testimonials/aula3.webp",
    "/testimonials/aula4.webp",
    "/testimonials/aula5.webp",
    "/testimonials/bocadosapo.webp",
    "/testimonials/leoeaarvore.webp",
    "/testimonials/aula6.webp",
    "/testimonials/aula3.webp",
    "/testimonials/aula4.webp",
    "/testimonials/aula5.webp",
    "/testimonials/leoeaarvore.webp",
    "/testimonials/aula2.webp",
    "/testimonials/aula3.webp",
    "/testimonials/aula4.webp",
    "/testimonials/aula5.webp",
    "/testimonials/aula6.webp",
    "/testimonials/aula5.webp",
    "/testimonials/bocadosapo.webp",
    "/testimonials/leoeaarvore.webp",
    "/testimonials/bocadosapo.webp",
    "/testimonials/leoeaarvore.webp",
    "/testimonials/aula5.webp",
    "/testimonials/bocadosapo.webp",
    "/testimonials/leoeaarvore.webp",
    "/testimonials/bocadosapo.webp",
    "/testimonials/leoeaarvore.webp",
  ];
  return (
    <div className="mx-auto my-10 max-w-8xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
      <ThreeDMarquee images={images} />
    </div>
  );
}
