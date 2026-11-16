"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { ActionState } from "@/types";

const initial: ActionState = { ok: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="E-mail" name="email" type="email" autoComplete="username" required maxLength={254} />
      <Field label="Senha" name="password" type="password" autoComplete="current-password" required maxLength={128} />
      {state.message ? (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
