"use client";

import { useState, useTransition } from "react";
import { saveSettingsAction } from "@/app/admin/(painel)/configuracoes/actions";
import { Button } from "@/components/ui/Button";
import { Field, TextareaField } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { StoreSettingsData } from "@/services/settings.service";

export function SettingsForm({ settings }: { settings: StoreSettingsData }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [v, setV] = useState({
    storeName: settings.storeName,
    whatsappNumber: settings.whatsappNumber ?? "",
    email: settings.email ?? "",
    instagram: settings.instagram ?? "",
    address: settings.address ?? "",
    about: settings.about ?? "",
  });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveSettingsAction(v);
      toast.push(res.ok ? (res.message ?? "Salvo.") : res.message, res.ok ? "success" : "error");
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5 rounded-sm border border-beige-200 bg-white p-5 sm:p-8">
      <Field label="Nome da loja" value={v.storeName} onChange={set("storeName")} required maxLength={80} />
      <div>
        <Field label="WhatsApp comercial (recebe os pedidos)" value={v.whatsappNumber} onChange={set("whatsappNumber")} required inputMode="tel" placeholder="75 99999-9999" />
        <p className="mt-1.5 text-xs text-ink-soft">Com DDD. Sem DDI, assume-se Brasil (+55).</p>
      </div>
      <Field label="E-mail" type="email" value={v.email} onChange={set("email")} maxLength={120} />
      <Field label="Instagram" value={v.instagram} onChange={set("instagram")} placeholder="@elegancymodas" maxLength={60} />
      <Field label="Endereço" value={v.address} onChange={set("address")} maxLength={200} />
      <TextareaField label="Sobre a loja" rows={4} value={v.about} onChange={set("about")} maxLength={1000} />
      <Button type="submit" loading={pending}>
        Salvar configurações
      </Button>
    </form>
  );
}
