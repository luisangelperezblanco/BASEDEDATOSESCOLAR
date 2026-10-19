"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import { Field, FormAlert, SubmitButton } from "@/components/ui";

type Initial = Record<
  "nombre" | "apellido" | "email" | "plantel" | "grado" | "seccion" | "anoEscolar" | "dependencia" | "localidad",
  string
>;

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, action] = useActionState(updateProfileAction, {});
  return (
    <form action={action} className="max-w-3xl space-y-6">
      <FormAlert state={state} />
      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Docente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" name="nombre" defaultValue={initial.nombre} required state={state} />
          <Field label="Apellido" name="apellido" defaultValue={initial.apellido} required state={state} />
          <Field label="Correo" name="email" defaultValue={initial.email} disabled className="sm:col-span-2" />
        </div>
      </section>
      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Plantel</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del plantel" name="plantel" defaultValue={initial.plantel} className="sm:col-span-2" state={state} />
          <Field label="Grado" name="grado" defaultValue={initial.grado} placeholder="Ej. 3er grado" state={state} />
          <Field label="Sección" name="seccion" defaultValue={initial.seccion} placeholder="Ej. A" state={state} />
          <Field label="Año escolar" name="anoEscolar" defaultValue={initial.anoEscolar} placeholder="Ej. 2026-2027" state={state} />
          <Field label="Dependencia" name="dependencia" defaultValue={initial.dependencia} placeholder="Ej. Nacional" state={state} />
          <Field label="Localidad" name="localidad" defaultValue={initial.localidad} className="sm:col-span-2" state={state} />
        </div>
      </section>
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
