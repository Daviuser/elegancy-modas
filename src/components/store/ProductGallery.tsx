"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: { id: string; url: string }[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) {
    return <div className="grid aspect-[3/4] place-items-center bg-beige-100 font-display text-xl text-beige-300">Sem foto</div>;
  }
  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-beige-100">
        <Image key={images[index].id} src={images[index].url} alt={`${name} — foto ${index + 1}`} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="animate-rise object-cover" />
        {images.length > 1 ? (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-ivory/85 hover:bg-ivory">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima foto" className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-ivory/85 hover:bg-ivory">
              <ChevronRight size={20} />
            </button>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn("relative block aspect-[3/4] w-full overflow-hidden border transition-colors", i === index ? "border-gold-500" : "border-transparent opacity-70 hover:opacity-100")}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
