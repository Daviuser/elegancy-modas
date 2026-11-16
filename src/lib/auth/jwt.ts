// Seguro para o runtime Edge (usado pelo middleware). Não importa nada de servidor.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "elegancy_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

export type SessionPayload = { sub: string; ver: number };

const encode = (secret: string) => new TextEncoder().encode(secret);

export async function signSession(payload: SessionPayload, secret: string) {
  return new SignJWT({ ver: payload.ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(encode(secret));
}

export async function verifySession(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encode(secret), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.ver !== "number") return null;
    return { sub: payload.sub, ver: payload.ver };
  } catch {
    return null;
  }
}
