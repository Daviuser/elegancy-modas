export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-light tracking-wide sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-ink-soft">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
