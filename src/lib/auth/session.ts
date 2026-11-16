import "server-only";
import { cookies } from "next/headers";
import { getEnv } from "@/config/env";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
  type SessionPayload,
} from "./jwt";

export async function createSession(adminId: string, tokenVersion: number) {
  const token = await signSession({ sub: adminId, ver: tokenVersion }, getEnv().AUTH_SECRET);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token, getEnv().AUTH_SECRET);
}
