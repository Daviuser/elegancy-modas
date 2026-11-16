import { siteConfig } from "@/config/site";

export function StoreFooter() {
  return (
    <footer className="border-t border-beige-200/70 py-8 text-center text-sm text-ink-soft">
      © {new Date().getFullYear()} {siteConfig.name}
    </footer>
  );
}
