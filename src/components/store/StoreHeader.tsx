import Link from "next/link";
import { siteConfig } from "@/config/site";

export function StoreHeader() {
  return (
    <header className="border-b border-beige-200/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-center px-6">
        <Link href="/" className="font-display text-xl tracking-[0.12em] text-ink">
          {siteConfig.name}
        </Link>
      </div>
    </header>
  );
}
