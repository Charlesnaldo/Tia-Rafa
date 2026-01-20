"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

export function ThreeDMarqueeDemo() {
  const images = [
    "/testimonials/bocadosapo.jpg",
    "/testimonials/leoeaarvore.jpg",
    "/testimonials/aula2.jpg",
    "/testimonials/aula3.jpg",
    "/testimonials/aula4.jpg",
    "/testimonials/aula5.jpg",
    "/testimonials/bocadosapo.jpg",
    "/testimonials/leoeaarvore.jpg",
    "/testimonials/aula6.jpg",
    "/testimonials/aula3.jpg",
    "/testimonials/aula4.jpg",
    "/testimonials/aula5.jpg",
    "/testimonials/leoeaarvore.jpg",
    "/testimonials/aula2.jpg",
    "/testimonials/aula3.jpg",
    "/testimonials/aula4.jpg",
    "/testimonials/aula5.jpg",
    "/testimonials/aula6.jpg",
    "/testimonials/aula5.jpg",
    "/testimonials/bocadosapo.jpg",
    "/testimonials/leoeaarvore.jpg",
    "/testimonials/bocadosapo.jpg",
    "/testimonials/leoeaarvore.jpg",
    "/testimonials/aula5.jpg",
    "/testimonials/bocadosapo.jpg",
    "/testimonials/leoeaarvore.jpg",
    "/testimonials/bocadosapo.jpg",
    "/testimonials/leoeaarvore.jpg",
  ];
  return (
    <div className="mx-auto my-10 max-w-8xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
      <ThreeDMarquee images={images} />
    </div>
  );
}
