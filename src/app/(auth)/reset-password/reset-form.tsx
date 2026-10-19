"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Field, FormAlert, SubmitButton } from "@/components/ui";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <FormAlert state={state} />
      <input type="hidden" name="token" value={token} />
      <Field label="Contraseña" name="password" type="password" autoComplete="new-password" required state={state} />
      <Field label="Confirmar contraseña" name="confirm" type="password" autoComplete="new-password" required state={state} />
      <SubmitButton className="w-full">Guardar contraseña</SubmitButton>
    </form>
  );
}
