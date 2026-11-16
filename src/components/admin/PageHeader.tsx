export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-light tracking-wide sm:text-4xl">{title}</h1>
      {description ? <p className="mt-2 max-w-xl text-ink-soft">{description}</p> : null}
    </div>
  );
}
