import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Sacola", "Seus dados", "WhatsApp"];

/** Indicador das etapas da compra. current: 1 (sacola), 2 (dados), 3 (WhatsApp). */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-10 flex items-center gap-3 text-sm sm:gap-4" aria-label="Etapas da compra">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const on = n === current;
        return (
          <Fragment key={label}>
            {i > 0 ? <li aria-hidden className={cn("h-px w-6 sm:w-14", done || on ? "bg-ink" : "bg-line")} /> : null}
            <li aria-current={on ? "step" : undefined} className={cn("flex items-center gap-2.5", on ? "text-ink" : done ? "text-ink-soft" : "text-mute")}>
              <span className={cn("grid h-7 w-7 place-items-center rounded-full border text-xs transition-colors duration-500", on ? "border-ink bg-ink text-paper" : done ? "border-wine bg-wine text-paper" : "border-line")}>
                {done ? <Check size={14} strokeWidth={2} /> : n}
              </span>
              <span className={cn(!on && "hidden sm:inline")}>{label}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
