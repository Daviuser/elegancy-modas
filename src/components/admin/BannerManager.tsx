"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { createBannerAction, deleteBannerAction, setBannerActiveAction } from "@/app/admin/(painel)/banners/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/config/uploads";

type Banner = { id: string; title: string; subtitle: string | null; linkUrl: string | null; imageUrl: string; active: boolean };

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function pick(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES[f.type]) return toast.push("Use JPG, PNG, WebP ou AVIF.", "error");
    if (f.size > MAX_IMAGE_BYTES) return toast.push("A imagem deve ter no máximo 5 MB.", "error");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return toast.push("Escolha a imagem do banner.", "error");
    setSaving(true);
    try {
      const blob = await upload(`banners/${crypto.randomUUID()}.${ALLOWED_IMAGE_TYPES[file.type]}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      const res = await createBannerAction({ title, subtitle, linkUrl, imageUrl: blob.url, imagePathname: blob.pathname });
      if (!res.ok) return toast.push(res.message, "error");
      toast.push(res.message ?? "Banner criado.");
      setTitle("");
      setSubtitle("");
      setLinkUrl("");
      pick(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Falha no envio da imagem.", "error");
    } finally {
      setSaving(false);
    }
  }

  function act(fn: () => Promise<{ ok: boolean; message?: string }>) {
    start(async () => {
      const res = await fn();
      toast.push(res.message ?? (res.ok ? "Concluído." : "Erro."), res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-sm border border-beige-200 bg-white p-5 sm:p-8">
        <h2 className="font-display text-2xl">Novo banner</h2>
        <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={80} disabled={saving} />
        <Field label="Subtítulo" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={160} disabled={saving} />
        <Field label="Link do botão (opcional)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/catalogo" maxLength={300} disabled={saving} />
        <div>
          <input ref={fileRef} type="file" accept={Object.keys(ALLOWED_IMAGE_TYPES).join(",")} onChange={(e) => pick(e.target.files?.[0] ?? null)} disabled={saving} aria-label="Imagem do banner" className="text-sm" />
          <p className="mt-1.5 text-xs text-ink-soft">Imagem horizontal (ideal 1920×900), até 5 MB.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="Pré-visualização" className="mt-3 max-h-48 rounded-sm object-cover" /> : null}
        </div>
        <Button type="submit" loading={saving}>
          {saving ? "Enviando…" : "Criar banner"}
        </Button>
      </form>

      {banners.length === 0 ? (
        <p className="text-sm text-ink-soft">Nenhum banner. Enquanto não houver um ativo, a loja exibe a abertura com o emblema.</p>
      ) : (
        <ul className="divide-y divide-beige-200 rounded-sm border border-beige-200 bg-white">
          {banners.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-4 p-4 sm:px-6">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-sm bg-beige-100">
                <Image src={b.imageUrl} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 basis-40">
                <p className="flex items-center gap-2 font-display text-xl">
                  {b.title} {b.active ? <Badge tone="gold">Ativo</Badge> : <Badge tone="muted">Inativo</Badge>}
                </p>
                {b.subtitle ? <p className="truncate text-sm text-ink-soft">{b.subtitle}</p> : null}
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" className="h-10 px-3" disabled={pending} onClick={() => act(() => setBannerActiveAction(b.id, !b.active))}>
                  {b.active ? "Desativar" : "Ativar"}
                </Button>
                <Button type="button" variant="ghost" className="h-10 px-3" disabled={pending} onClick={() => confirm("Excluir este banner?") && act(() => deleteBannerAction(b.id))}>
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
