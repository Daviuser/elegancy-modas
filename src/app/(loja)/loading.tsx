export default function Loading() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-6 py-16 lg:grid-cols-4" aria-busy>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse bg-beige-100" />
      ))}
    </div>
  );
}
