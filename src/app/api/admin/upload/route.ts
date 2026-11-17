import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/config/uploads";
import { getCurrentAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

/**
 * Emite tokens de upload de curta duração para o navegador (upload direto ao Vercel Blob,
 * que evita o limite de 4,5 MB de corpo das funções). O token de leitura/escrita
 * (BLOB_READ_WRITE_TOKEN) permanece no servidor; só administradores autenticados recebem tokens.
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Armazenamento de imagens não configurado." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const admin = await getCurrentAdmin();
        if (!admin) throw new Error("Não autorizado.");
        if (!/^(products|banners)\/[A-Za-z0-9_-]+\.(jpg|png|webp|avif)$/.test(pathname)) {
          throw new Error("Caminho de arquivo inválido.");
        }
        return {
          allowedContentTypes: Object.keys(ALLOWED_IMAGE_TYPES),
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ adminId: admin.id }),
        };
      },
      onUploadCompleted: async () => {
        // O registro no banco é feito pela Server Action ao salvar o produto.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload.";
    return NextResponse.json({ error: message }, { status: message === "Não autorizado." ? 401 : 400 });
  }
}
