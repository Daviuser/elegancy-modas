import { Emblem } from "@/components/brand/Emblem";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="flex flex-col items-center px-6 py-16 text-center sm:py-24">
      <div className="animate-settle">
        <Emblem size={300} priority className="h-auto w-56 sm:w-72" />
      </div>

      <h1
        className="animate-rise mt-8 font-display text-4xl font-light tracking-[0.08em] sm:text-6xl"
        style={{ animationDelay: "500ms" }}
      >
        {siteConfig.name}
      </h1>

      <span
        className="animate-rise mt-6 block h-px w-16 bg-gold-400"
        style={{ animationDelay: "700ms" }}
        aria-hidden
      />

      <p
        className="animate-rise mt-6 max-w-md font-display text-xl leading-relaxed text-ink-soft sm:text-2xl"
        style={{ animationDelay: "850ms" }}
      >
        {siteConfig.description}
      </p>

      <p className="animate-rise mt-10 text-sm text-ink-soft" style={{ animationDelay: "1000ms" }}>
        Estamos preparando a primeira coleção da loja virtual.
      </p>
    </section>
  );
}
