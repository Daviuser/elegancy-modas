"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES } from "@/config/uploads";
import type { ImageItem } from "@/types/product";

let seq = 0;
const nextKey = () => `img-${++seq}`;

type Props = { images: ImageItem[]; onChange: (next: ImageItem[]) => void; disabled?: boolean };

export function ImageManager({ images, onChange, disabled }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...images];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_PRODUCT_IMAGES) {
        toast.push(`Máximo de ${MAX_PRODUCT_IMAGES} imagens por produto.`, "error");
        break;
      }
      if (!ALLOWED_IMAGE_TYPES[file.type]) {
        toast.push(`"${file.name}": use JPG, PNG, WebP ou AVIF.`, "error");
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.push(`"${file.name}" tem mais de 5 MB.`, "error");
        continue;
      }
      next.push({ key: nextKey(), url: URL.createObjectURL(file), file });
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function remove(index: number) {
    const item = images[index];
    if (item.file) URL.revokeObjectURL(item.url);
    onChange(images.filter((_, i) => i !== index));
  }

  const btn =
    "grid h-9 w-9 place-items-center rounded-sm text-ink-soft transition-colors hover:bg-beige-100 hover:text-ink disabled:opacity-30";

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.key} className="overflow-hidden rounded-sm border border-beige-200 bg-white">
            <div className="relative aspect-[3/4] bg-beige-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-ink px-2.5 py-0.5 text-xs text-ivory">
                  Principal
                </span>
              ) : null}
              {img.file ? (
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs text-ink-soft">
                  Nova
                </span>
              ) : null}
            </div>
            <div className="flex items-center justify-between px-1 py-1">
              <button type="button" className={btn} onClick={() => move(i, i - 1)} disabled={disabled || i === 0} aria-label="Mover para trás">
                <ArrowLeft size={16} />
              </button>
              <button type="button" className={btn} onClick={() => move(i, 0)} disabled={disabled || i === 0} aria-label="Tornar principal" title="Tornar principal">
                <Star size={16} />
              </button>
              <button type="button" className={btn} onClick={() => move(i, i + 1)} disabled={disabled || i === images.length - 1} aria-label="Mover para frente">
                <ArrowRight size={16} />
              </button>
              <button type="button" className={btn} onClick={() => remove(i)} disabled={disabled} aria-label="Remover imagem">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}

        {images.length < MAX_PRODUCT_IMAGES ? (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-beige-300 text-sm text-ink-soft transition-colors hover:border-gold-500 hover:text-gold-600"
            >
              <ImagePlus size={24} strokeWidth={1.5} />
              Adicionar fotos
            </button>
          </li>
        ) : null}
      </ul>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={Object.keys(ALLOWED_IMAGE_TYPES).join(",")}
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
        aria-label="Selecionar imagens"
      />
      <p className="mt-3 text-xs text-ink-soft">
        JPG, PNG, WebP ou AVIF, até 5 MB cada (máx. {MAX_PRODUCT_IMAGES}). A primeira foto é a principal. As novas fotos só são enviadas ao salvar.
      </p>
    </div>
  );
}
