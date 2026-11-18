"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Img = { id: string; url: string };

/** Galeria: no celular é um carrossel por deslize (scroll-snap nativo); no desktop há miniaturas laterais. */
export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = scroller.current;
      if (el && el.clientWidth > 0) setIndex(Math.round(el.scrollLeft / el.clientWidth));
    });
  }, []);

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  function go(i: number) {
    const el = scroller.current;
    if (!el) return;
    const next = (i + images.length) % images.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  if (images.length === 0) {
    return (
      <div className="grid aspect-[4/5] place-items-center bg-paper-deep font-display text-6xl italic text-mute/50">
        {name.slice(0, 1)}
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[5.5rem_1fr] lg:gap-4">
      {images.length > 1 ? (
        <ul className="order-first hidden max-h-[75vh] flex-col gap-2.5 overflow-y-auto lg:flex">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-[3/4] w-full overflow-hidden bg-paper-deep outline outline-1 outline-offset-2 transition-[outline-color,opacity] duration-300",
                  i === index ? "outline-ink" : "opacity-70 outline-transparent hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="88px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="group relative -mx-4 sm:mx-0">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          tabIndex={0}
          aria-label={`Fotos de ${name}`}
        >
          {images.map((img, i) => (
            <div key={img.id} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-paper-deep">
              <Image
                src={img.url}
                alt={`${name} — foto ${i + 1} de ${images.length}`}
                fill
                priority={i === 0}
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center bg-paper/90 opacity-0 transition-opacity duration-300 hover:bg-paper group-hover:opacity-100 lg:grid">
              <ChevronLeft size={20} strokeWidth={1.4} />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Próxima foto" className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center bg-paper/90 opacity-0 transition-opacity duration-300 hover:bg-paper group-hover:opacity-100 lg:grid">
              <ChevronRight size={20} strokeWidth={1.4} />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden" aria-hidden>
              {images.map((img, i) => (
                <span key={img.id} className={cn("h-1.5 rounded-full transition-all duration-300", i === index ? "w-5 bg-paper" : "w-1.5 bg-paper/60")} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
