/** Estado padrão devolvido por Server Actions usadas com useActionState. */
export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
