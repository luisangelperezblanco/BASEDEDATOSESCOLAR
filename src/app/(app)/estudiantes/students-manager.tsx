"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { deleteStudentAction, saveStudentAction } from "@/lib/actions/students";
import { CONDICIONES, CONDICION_LABELS, SEXOS, SEXO_LABELS } from "@/lib/constants";
import type { StudentDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Field, FormAlert, SelectField, SubmitButton } from "@/components/ui";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/icons";

export function StudentsManager({ students }: { students: StudentDTO[] }) {
  const [editing, setEditing] = useState<StudentDTO | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const filtered = q ? students.filter((s) => `${s.apellidos} ${s.nombres}`.toLowerCase().includes(q)) : students;
  const activos = students.filter((s) => s.activo);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Buscar estudiante…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <span className="text-sm text-slate-500">
          {activos.length} activos · {activos.filter((s) => s.sexo === "V").length} V · {activos.filter((s) => s.sexo === "H").length} H
        </span>
        <button className="btn-primary ml-auto" onClick={() => setEditing("new")}>
          <PlusIcon className="h-4 w-4" /> Agregar estudiante
        </button>
      </div>

      {editing && (
        <StudentForm key={editing === "new" ? "new" : editing.id} student={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
      )}

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="w-10">N°</th>
              <th>Apellidos y nombres</th>
              <th className="w-16 text-center">Edad</th>
              <th className="w-16 text-center">Sexo</th>
              <th>Condición</th>
              <th className="w-20 text-center">Estado</th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  {students.length ? "Sin resultados." : "Aún no hay estudiantes. Agrega el primero."}
                </td>
              </tr>
            )}
            {filtered.map((s, i) => (
              <tr key={s.id} className={cn(!s.activo && "text-slate-400")}>
                <td className="text-center">{i + 1}</td>
                <td className="font-medium">
                  {s.apellidos}, {s.nombres}
                </td>
                <td className="text-center">{s.edad}</td>
                <td className="text-center">{s.sexo}</td>
                <td>{CONDICION_LABELS[s.condicion as keyof typeof CONDICION_LABELS] ?? s.condicion}</td>
                <td className="text-center">
                  <span className={cn("badge", s.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                    {s.activo ? "Activo" : "Retirado"}
                  </span>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button className="btn-secondary px-2 py-1" title="Editar" onClick={() => setEditing(s)}>
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="btn-danger px-2 py-1"
                      title="Eliminar"
                      disabled={pending}
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${s.nombres} ${s.apellidos}? Se borrarán también sus registros de asistencia, evaluaciones y diagnóstico.`)) {
                          startTransition(() => deleteStudentAction(s.id));
                        }
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentForm({ student, onDone }: { student: StudentDTO | null; onDone: () => void }) {
  const [state, action] = useActionState(saveStudentAction, {});
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="card space-y-4 p-5">
      <h2 className="font-semibold text-slate-900">{student ? "Editar estudiante" : "Nuevo estudiante"}</h2>
      <FormAlert state={state.ok ? {} : state} />
      {student && <input type="hidden" name="id" value={student.id} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Field label="Apellidos" name="apellidos" defaultValue={student?.apellidos} required className="lg:col-span-2" state={state} />
        <Field label="Nombres" name="nombres" defaultValue={student?.nombres} required className="lg:col-span-2" state={state} />
        <Field label="Edad" name="edad" type="number" min={3} max={25} defaultValue={student?.edad} required state={state} />
        <SelectField
          label="Sexo"
          name="sexo"
          defaultValue={student?.sexo ?? "V"}
          options={SEXOS.map((s) => ({ value: s, label: `${s} · ${SEXO_LABELS[s]}` }))}
          state={state}
        />
        <SelectField
          label="Condición"
          name="condicion"
          defaultValue={student?.condicion ?? "REGULAR"}
          className="lg:col-span-2"
          options={CONDICIONES.map((c) => ({ value: c, label: CONDICION_LABELS[c] }))}
          state={state}
        />
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input type="checkbox" name="activo" defaultChecked={student?.activo ?? true} className="h-4 w-4 rounded border-slate-300" />
          Activo
        </label>
      </div>
      <div className="flex gap-2">
        <SubmitButton>{student ? "Guardar" : "Agregar"}</SubmitButton>
        <button type="button" className="btn-secondary" onClick={onDone}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
