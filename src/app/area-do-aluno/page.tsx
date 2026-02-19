import Link from "next/link";

export default function AreaDoAlunoPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-20 font-fredoka text-[#2D3748]">
      <section className="mx-auto max-w-3xl rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">Area do Aluno</p>
        <h1 className="mt-3 text-4xl font-black text-gray-900">Em breve</h1>
        <p className="mt-4 text-sm font-bold text-gray-500">
          Estamos preparando uma area exclusiva para seus materiais e downloads.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex cursor-pointer items-center rounded-2xl bg-purple-600 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-purple-700"
        >
          Voltar para inicio
        </Link>
      </section>
    </main>
  );
}
