export function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-sm border border-beige-200 bg-white p-5">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-4xl font-light">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
