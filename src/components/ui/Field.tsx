import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Field({ label, error, id, className, ...rest }: Props) {
  const fieldId = id ?? rest.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm text-ink-soft">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-11 w-full rounded-sm border border-beige-300 bg-white px-3 text-base text-ink transition-colors placeholder:text-beige-300 focus:border-gold-500 focus:outline-none",
          error && "border-red-700",
          className,
        )}
        {...rest}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
