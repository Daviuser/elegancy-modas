import Link from "next/link";
import { Emblem } from "@/components/brand/Emblem";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import type { StoreSettingsData } from "@/services/settings.service";

type Props = { settings: StoreSettingsData; categories: { name: string; slug: string }[] };

export function StoreFooter({ settings, categories }: Props) {
  const wa = normalizeWhatsAppNumber(settings.whatsappNumber);
  const link = "transition-colors hover:text-gold-600";
  return (
    <footer className="mt-24 border-t border-beige-200 bg-beige-100/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Emblem size={96} className="h-auto w-16" />
          <p className="mt-4 font-display text-2xl tracking-wide">{settings.storeName}</p>
          {settings.about ? <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">{settings.about}</p> : null}
        </div>

        <div>
          <p className="font-display text-xl">Contato</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {wa ? (
              <li>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={link}>
                  WhatsApp: +{wa.slice(0, 2)} {wa.slice(2)}
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className={link}>{settings.email}</a>
              </li>
            ) : null}
            {settings.instagram ? (
              <li>
                <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className={link}>
                  Instagram: @{settings.instagram}
                </a>
              </li>
            ) : null}
            {settings.address ? <li>{settings.address}</li> : null}
          </ul>
        </div>

        <div>
          <p className="font-display text-xl">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li><Link href="/catalogo" className={link}>Catálogo</Link></li>
            <li><Link href="/catalogo?ordem=novidades" className={link}>Novidades</Link></li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}><Link href={`/catalogo?categoria=${c.slug}`} className={link}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-beige-200 py-5 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
      </p>
    </footer>
  );
}
