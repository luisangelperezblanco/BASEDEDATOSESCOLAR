"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";
import { Field, FormAlert, SubmitButton } from "@/components/ui";

export default function RegisterPage() {
  const [state, action] = useActionState(registerAction, {});
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
      <p className="mt-1 text-sm text-slate-500">Registra tu cuenta de docente.</p>
      <form action={action} className="mt-6 space-y-4">
        <FormAlert state={state} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" name="nombre" required state={state} />
          <Field label="Apellido" name="apellido" required state={state} />
        </div>
        <Field label="Correo" name="email" type="email" autoComplete="email" required state={state} />
        <Field label="Contraseña" name="password" type="password" autoComplete="new-password" required state={state} />
        <Field label="Confirmar contraseña" name="confirm" type="password" autoComplete="new-password" required state={state} />
        <SubmitButton className="w-full">Crear cuenta</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
