import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

/**
 * Primeira barreira (rápida) para /admin/*: exige cookie com assinatura válida.
 * A verificação definitiva (admin ativo, versão do token) ocorre em requireAdmin().
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  const session = token && secret ? await verifySession(token, secret) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
