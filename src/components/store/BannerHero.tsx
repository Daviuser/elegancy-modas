import Image from "next/image";
import Link from "next/link";

type Props = { title: string; subtitle: string | null; linkUrl: string | null; imageUrl: string };

export function BannerHero({ title, subtitle, linkUrl, imageUrl }: Props) {
  return (
    <section className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-beige-100 sm:min-h-[62vh] sm:items-center">
      <Image src={imageUrl} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/25" aria-hidden />
      <div className="mx-auto w-full max-w-7xl px-6 pb-14 pt-24 sm:pb-0">
        <div className="animate-rise max-w-xl text-white">
          <h1 className="font-display text-5xl font-light leading-[1.05] tracking-wide sm:text-7xl">{title}</h1>
          {subtitle ? <p className="mt-4 text-lg text-white/90">{subtitle}</p> : null}
          <Link
            href={linkUrl ?? "/catalogo"}
            className="mt-8 inline-flex h-12 items-center border border-white px-8 text-sm tracking-wide transition-colors duration-300 hover:bg-white hover:text-ink"
          >
            {linkUrl ? "Saiba mais" : "Ver catálogo"}
          </Link>
        </div>
      </div>
    </section>
  );
}
