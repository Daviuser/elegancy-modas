import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-ivory hover:bg-gold-600",
  outline: "border border-beige-300 text-ink hover:border-gold-500 hover:text-gold-600",
  ghost: "text-ink-soft hover:bg-beige-100 hover:text-ink",
  danger: "border border-red-800/30 text-red-800 hover:bg-red-50",
};

/** Classes do botão — útil para <Link> com aparência de botão. */
export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-sm px-6 text-sm tracking-wide transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60",
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
      {children}
    </button>
  );
}
