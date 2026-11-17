import { cn } from "@/lib/utils";

const tones = {
  gold: "bg-gold-400/15 text-gold-600",
  neutral: "bg-beige-100 text-ink-soft",
  danger: "bg-red-50 text-red-800",
  muted: "bg-beige-200/60 text-ink-soft",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs", tones[tone])}>{children}</span>
  );
}
