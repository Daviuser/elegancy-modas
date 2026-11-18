import { useId } from "react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Field({ label, error, id, className, ...rest }: Props) {
  const autoId = useId();
  const fieldId = id ?? rest.name ?? autoId;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm text-ink-soft">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-11 w-full rounded-none border border-line bg-white px-3 text-base text-ink transition-colors placeholder:text-mute/70 hover:border-mute focus:border-ink focus:outline-none",
          error && "border-red-700",
          className,
        )}
        {...rest}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-none border border-line bg-white px-3 text-base text-ink transition-colors hover:border-mute focus:border-ink focus:outline-none";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string };

export function SelectField({ label, error, id, className, children, ...rest }: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? rest.name ?? autoId;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm text-ink-soft">
        {label}
      </label>
      <select id={fieldId} className={cn(controlClass, "h-11", className)} {...rest}>
        {children}
      </select>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string };

export function TextareaField({ label, error, id, className, ...rest }: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? rest.name ?? autoId;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm text-ink-soft">
        {label}
      </label>
      <textarea id={fieldId} className={cn(controlClass, "py-2.5", className)} {...rest} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
