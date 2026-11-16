import Image from "next/image";
import { cn } from "@/lib/utils";

/** Emblema dourado. O fundo branco da arte some sobre off-white graças ao multiply. */
export function Emblem({ size = 120, priority = false, className }: { size?: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/brand/emblema.png"
      alt="Emblema Elegancy Modas"
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={cn("mix-blend-multiply", className)}
    />
  );
}
