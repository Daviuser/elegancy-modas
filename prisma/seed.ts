/**
 * Seed inicial: cria a primeira administradora e o registro de configurações.
 * Idempotente: executar novamente NÃO altera senha de admin já existente.
 * Credenciais vêm exclusivamente do ambiente (SEED_*).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Administradora";

  if (!email || !password) {
    throw new Error("Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD no .env antes do seed.");
  }
  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD deve ter pelo menos 12 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash },
  });

  const whatsapp = process.env.SEED_WHATSAPP_NUMBER?.replace(/\D/g, "") || null;
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", storeName: "Elegancy Modas", whatsappNumber: whatsapp },
  });

  console.log(`✔ Administradora pronta: ${admin.email}`);
  console.log("✔ Configurações da loja prontas.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
