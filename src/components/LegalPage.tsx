import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageProps = { title: string; updatedAt: string; draft?: boolean; children: ReactNode };

export default function LegalPage({ title, updatedAt, draft = false, children }: LegalPageProps) {
  return (
    <article className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-slate-700 lg:pt-80">
      <Link href="/" className="inline-flex min-h-11 items-center font-semibold text-purple-700 underline underline-offset-4">Voltar à loja</Link>
      <h1 className="mb-6 mt-6 text-3xl font-bold text-purple-950 sm:text-4xl">{title}</h1>
      {draft ? (
        <p className="mb-6 rounded-2xl bg-purple-50 p-5 text-sm leading-relaxed">Texto base em revisão. Os campos [PREENCHER] precisam ser completados pelo responsável pela loja.</p>
      ) : null}
      <p className="mb-6 text-sm text-slate-500">Atualizado em {updatedAt}.</p>
      <div className="space-y-8 text-base leading-7 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-purple-950 [&_p+p]:mt-3 [&_a]:text-purple-700 [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </article>
  );
}
