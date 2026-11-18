export default function Loading() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-8" aria-busy role="status">
      <span className="sr-only">Carregando…</span>
      <div className="h-10 w-56 animate-pulse bg-paper-deep" />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-pulse bg-paper-deep" />
            <div className="mt-3 h-4 w-2/3 animate-pulse bg-paper-deep" />
          </div>
        ))}
      </div>
    </div>
  );
}
