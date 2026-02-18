import React from "react";
import Image from "next/image";
import { Download } from "lucide-react";

interface ActivityCardProps {
  title: string;
  description: string;
  downloadLink: string;
  image: string;
  category: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  description,
  downloadLink,
  image,
  category,
}) => {
  return (
    <article className="group overflow-hidden rounded-[1.7rem] border border-white/70 bg-white/90 shadow-[0_15px_45px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.15)]">
      <div className="relative h-48 w-full">
        <Image src={image} alt={title} fill className="object-cover" />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">
          {category}
        </div>
      </div>

      <div className="flex flex-col p-5 text-left">
        <h3 className="mb-2 text-xl font-black text-gray-900">{title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-gray-600">{description}</p>

        <div className="mb-4 h-px w-full bg-gradient-to-r from-blue-100 via-pink-100 to-transparent" />

        <a
          href={downloadLink}
          download
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-blue-700"
        >
          <Download size={15} />
          Baixar gratis
        </a>
      </div>
    </article>
  );
};

export default ActivityCard;
