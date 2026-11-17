/** Estado padrão devolvido por Server Actions usadas com useActionState. */
export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Resultado padrão das Server Actions administrativas (Etapa 2). */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string };
