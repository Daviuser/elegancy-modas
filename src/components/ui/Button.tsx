import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-wine",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink-soft hover:bg-paper-deep hover:text-ink",
  danger: "border border-wine/40 text-wine hover:bg-wine hover:text-paper",
};

/** Classes do botão — útil para <Link> com aparência de botão. */
export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex h-11 select-none items-center justify-center gap-2 rounded-none px-6 text-sm tracking-[0.03em]",
    "transition-[background-color,color,border-color,transform] duration-300 ease-soft active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    variants[variant],
    className,
  );
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean };

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      ) : null}
      {children}
    </button>
  );
}
