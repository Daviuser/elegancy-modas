import Image from "next/image";
import { HeroCopy } from "@/components/store/Hero";

type Props = { title: string; subtitle: string | null; linkUrl: string | null; imageUrl: string };

/** Abertura com o banner ativo cadastrado no painel (imagem editorial + texto ao lado). */
export function BannerHero({ title, subtitle, linkUrl, imageUrl }: Props) {
  return (
    <section>
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 pb-16 pt-8 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:pb-24 lg:pt-12">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <HeroCopy
            title={title}
            subtitle={subtitle ?? "Descubra as peças da estação, selecionadas com cuidado para você."}
            href={linkUrl ?? "/catalogo"}
            cta={linkUrl ? "Saiba mais" : "Ver a coleção"}
          />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-7">
          <div className="animate-settle relative aspect-[4/5] overflow-hidden bg-paper-deep sm:aspect-[7/6]">
            <Image src={imageUrl} alt="" fill priority sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
