export default function Loading() {
  return (
    <div role="status" aria-label="Carregando catálogo" className="mx-auto min-h-[1600px] max-w-[1400px] px-4 pt-[235px] lg:pt-[330px]">
      <span className="sr-only">Carregando catálogo</span>
      <div aria-hidden="true" className="mb-6 h-40 rounded-3xl bg-purple-50 motion-safe:animate-pulse" />
      <div aria-hidden="true" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="h-[360px] rounded-2xl bg-purple-50 p-3 motion-safe:animate-pulse">
            <div className="aspect-square rounded-xl bg-purple-100" />
            <div className="mt-4 h-4 w-4/5 rounded bg-purple-100" />
            <div className="mt-3 h-4 w-2/5 rounded bg-purple-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
