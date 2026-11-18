import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import type { StoreSettingsData } from "@/services/settings.service";

type Props = { settings: StoreSettingsData; categories: { name: string; slug: string }[] };

export function StoreFooter({ settings, categories }: Props) {
  const wa = normalizeWhatsAppNumber(settings.whatsappNumber);
  const [first, ...rest] = settings.storeName.split(" ");
  const link = "link-underline pb-0.5 text-paper/75 hover:text-paper";

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[90rem] px-4 pb-10 pt-16 sm:px-8 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-5xl leading-none sm:text-6xl">
              {first}
              {rest.length > 0 ? <span className="italic text-paper/60"> {rest.join(" ")}</span> : null}
            </p>
            {settings.about ? <p className="mt-6 max-w-sm leading-relaxed text-paper/70">{settings.about}</p> : null}
            {wa ? (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex h-12 items-center gap-2 border border-paper/40 px-6 text-sm transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
              >
                Falar no WhatsApp
                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ) : null}
          </div>

          <div>
            <p className="font-display text-xl italic text-paper/60">Explore</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href="/catalogo?ordem=novidades" className={link}>Novidades</Link></li>
              <li><Link href="/catalogo" className={link}>Catálogo completo</Link></li>
              <li><Link href="/carrinho" className={link}>Sacola</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-display text-xl italic text-paper/60">Categorias</p>
            <ul className="mt-5 space-y-3 text-sm">
              {categories.slice(0, 7).map((c) => (
                <li key={c.slug}><Link href={`/catalogo?categoria=${c.slug}`} className={link}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-xl italic text-paper/60">Contato</p>
            <ul className="mt-5 space-y-3 text-sm text-paper/75">
              {wa ? <li>WhatsApp +{wa.slice(0, 2)} {wa.slice(2)}</li> : null}
              {settings.email ? (
                <li><a href={`mailto:${settings.email}`} className={link}>{settings.email}</a></li>
              ) : null}
              {settings.instagram ? (
                <li>
                  <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className={link}>
                    @{settings.instagram}
                  </a>
                </li>
              ) : null}
              {settings.address ? <li className="max-w-[16rem] leading-relaxed">{settings.address}</li> : null}
            </ul>
          </div>
        </div>

        <p className="mt-16 border-t border-paper/15 pt-6 text-xs text-paper/50">
          © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
