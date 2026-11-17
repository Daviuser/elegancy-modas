"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { VariantItem } from "@/types/product";

let seq = 0;
const nextKey = () => `var-${++seq}`;

const SIZES = ["PP", "P", "M", "G", "GG", "ÚNICO"];
const norm = (v: { size: string; colorName: string }) =>
  `${v.size.trim().toLowerCase()}|${v.colorName.trim().toLowerCase()}`;

export function newVariant(partial?: Partial<VariantItem>): VariantItem {
  return { key: nextKey(), size: "", colorName: "", active: true, stock: "0", ...partial };
}

/** Chaves duplicadas (tamanho + cor, sem diferenciar maiúsculas). */
export function findDuplicateKeys(variants: VariantItem[]): Set<string> {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const v of variants) {
    const k = norm(v);
    if (k === "|") continue;
    if (seen.has(k)) dups.add(k);
    seen.add(k);
  }
  return dups;
}

type Props = { variants: VariantItem[]; onChange: (next: VariantItem[]) => void; disabled?: boolean };

const input =
  "h-10 w-full rounded-sm border border-beige-300 bg-white px-3 text-base focus:border-gold-500 focus:outline-none";

export function VariantEditor({ variants, onChange, disabled }: Props) {
  const toast = useToast();
  const [genColor, setGenColor] = useState("");
  const [genSizes, setGenSizes] = useState<string[]>([]);
  const dups = findDuplicateKeys(variants);

  function update(key: string, patch: Partial<VariantItem>) {
    onChange(variants.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function generate() {
    const color = genColor.trim();
    if (!color) return toast.push("Informe a cor para gerar as combinações.", "error");
    if (genSizes.length === 0) return toast.push("Escolha ao menos um tamanho.", "error");
    const existing = new Set(variants.map(norm));
    const added = genSizes
      .filter((size) => !existing.has(norm({ size, colorName: color })))
      .map((size) => newVariant({ size, colorName: color }));
    if (added.length === 0) return toast.push("Todas essas combinações já existem.", "error");
    // Remove linhas totalmente vazias antes de acrescentar
    const base = variants.filter((v) => v.id || v.size.trim() || v.colorName.trim());
    onChange([...base, ...added]);
    setGenSizes([]);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-sm bg-beige-100/70 p-4">
        <p className="text-sm text-ink-soft">Gerar combinações de uma cor</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={genColor}
            onChange={(e) => setGenColor(e.target.value)}
            placeholder="Cor (ex.: Preto)"
            maxLength={40}
            disabled={disabled}
            className={cn(input, "w-full sm:w-48")}
            aria-label="Cor para gerar combinações"
          />
          {SIZES.map((s) => {
            const on = genSizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                disabled={disabled}
                aria-pressed={on}
                onClick={() => setGenSizes(on ? genSizes.filter((x) => x !== s) : [...genSizes, s])}
                className={cn(
                  "h-10 min-w-10 rounded-sm border px-3 text-sm transition-colors",
                  on ? "border-ink bg-ink text-ivory" : "border-beige-300 bg-white hover:border-gold-500",
                )}
              >
                {s}
              </button>
            );
          })}
          <button
            type="button"
            onClick={generate}
            disabled={disabled}
            className="h-10 rounded-sm border border-gold-500 px-4 text-sm text-gold-600 transition-colors hover:bg-gold-400/10"
          >
            Adicionar
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {variants.map((v) => {
          const isDup = dups.has(norm(v));
          return (
            <li
              key={v.key}
              className={cn(
                "grid grid-cols-2 items-end gap-3 rounded-sm border bg-white p-3 md:grid-cols-[7rem_1fr_9rem_auto_auto]",
                isDup ? "border-red-700" : "border-beige-200",
              )}
            >
              <label className="text-xs text-ink-soft">
                Tamanho
                <input
                  list="size-options"
                  className={cn(input, "mt-1")}
                  value={v.size}
                  maxLength={20}
                  disabled={disabled}
                  onChange={(e) => update(v.key, { size: e.target.value })}
                />
              </label>
              <label className="text-xs text-ink-soft">
                Cor
                <input
                  className={cn(input, "mt-1")}
                  value={v.colorName}
                  maxLength={40}
                  disabled={disabled}
                  onChange={(e) => update(v.key, { colorName: e.target.value })}
                />
              </label>

              {v.id ? (
                <div className="text-xs text-ink-soft">
                  Estoque atual
                  <p className="mt-1 flex h-10 items-center text-base text-ink">{v.stock} un.</p>
                </div>
              ) : (
                <label className="text-xs text-ink-soft">
                  Estoque inicial
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    className={cn(input, "mt-1")}
                    value={v.stock}
                    disabled={disabled}
                    onChange={(e) => update(v.key, { stock: e.target.value })}
                  />
                </label>
              )}

              <label className="flex h-10 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={v.active}
                  disabled={disabled}
                  onChange={(e) => update(v.key, { active: e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-gold-500)]"
                />
                Ativa
              </label>

              {v.id ? (
                <span className="hidden w-9 md:block" />
              ) : (
                <button
                  type="button"
                  onClick={() => onChange(variants.filter((x) => x.key !== v.key))}
                  disabled={disabled}
                  aria-label="Remover linha"
                  className="grid h-10 w-9 place-items-center rounded-sm text-ink-soft hover:bg-beige-100 hover:text-ink"
                >
                  <Trash2 size={16} />
                </button>
              )}

              {isDup ? <p className="col-span-full text-sm text-red-700">Combinação de tamanho e cor repetida.</p> : null}
            </li>
          );
        })}
      </ul>

      <datalist id="size-options">
        {SIZES.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={() => onChange([...variants, newVariant()])}
        disabled={disabled}
        className="inline-flex items-center gap-2 text-sm text-gold-600 hover:underline"
      >
        <Plus size={16} /> Adicionar variação
      </button>
      <p className="text-xs text-ink-soft">
        O saldo de variações já salvas só muda pela tela de Estoque, que registra cada movimentação. Variações não são
        apagadas: desative-as. Para peça sem variação, use tamanho “ÚNICO” e uma cor (ex.: “Padrão”).
      </p>
    </div>
  );
}
