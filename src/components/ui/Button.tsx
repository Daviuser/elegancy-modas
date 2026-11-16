import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
};

const variants = {
  primary: "bg-ink text-ivory hover:bg-gold-600",
  outline: "border border-beige-300 text-ink hover:border-gold-500 hover:text-gold-600",
  ghost: "text-ink-soft hover:bg-beige-100 hover:text-ink",
};

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-sm px-6 text-sm tracking-wide transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
