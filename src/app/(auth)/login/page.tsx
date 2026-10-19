"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Field, FormAlert, SubmitButton } from "@/components/ui";

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, {});
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-slate-500">Ingresa con tu cuenta de docente.</p>
      <form action={action} className="mt-6 space-y-4">
        <FormAlert state={state} />
        <Field label="Correo" name="email" type="email" autoComplete="email" required state={state} />
        <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required state={state} />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <SubmitButton className="w-full">Entrar</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </>
  );
}
