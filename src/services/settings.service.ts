import "server-only";
import { db } from "@/lib/db";
import type { SettingsInput } from "@/lib/validations/settings";

export type StoreSettingsData = {
  storeName: string;
  whatsappNumber: string | null;
  email: string | null;
  instagram: string | null;
  address: string | null;
  about: string | null;
};

const DEFAULTS: StoreSettingsData = {
  storeName: "Elegancy Modas",
  whatsappNumber: null,
  email: null,
  instagram: null,
  address: null,
  about: null,
};

/** Fonte única das informações da loja (inclusive o WhatsApp comercial). */
export async function getStoreSettings(): Promise<StoreSettingsData> {
  const s = await db.storeSettings.findUnique({ where: { id: "default" } });
  if (!s) return DEFAULTS;
  return {
    storeName: s.storeName,
    whatsappNumber: s.whatsappNumber,
    email: s.email,
    instagram: s.instagram,
    address: s.address,
    about: s.about,
  };
}

export async function saveStoreSettings(input: SettingsInput) {
  await db.storeSettings.upsert({
    where: { id: "default" },
    update: input,
    create: { id: "default", ...input },
  });
}
