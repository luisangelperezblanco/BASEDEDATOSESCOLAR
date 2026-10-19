"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { Field, FormAlert, SubmitButton } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, {});
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h1>
      <p className="mt-1 text-sm text-slate-500">Te generaremos un enlace para restablecerla.</p>
      <form action={action} className="mt-6 space-y-4">
        <FormAlert state={state} />
        <Field label="Correo" name="email" type="email" required state={state} />
        <SubmitButton className="w-full">Enviar enlace</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </>
  );
}
