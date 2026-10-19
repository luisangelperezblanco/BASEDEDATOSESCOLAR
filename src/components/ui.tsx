"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/types";

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary", className)}>
      {pending ? "Guardando…" : children}
    </button>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (state.error) {
    return <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  }
  if (state.ok && state.message) {
    return (
      <p className="break-all rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {state.message}
      </p>
    );
  }
  return null;
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  state?: FormState;
};

export function Field({ label, name, state, className, ...props }: FieldProps) {
  const err = state?.fieldErrors?.[name]?.[0];
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input id={name} name={name} className={cn("input", err && "border-red-400")} {...props} />
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  state?: FormState;
  options: { value: string; label: string }[];
};

export function SelectField({ label, name, state, options, className, ...props }: SelectProps) {
  const err = state?.fieldErrors?.[name]?.[0];
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <select id={name} name={name} className={cn("input", err && "border-red-400")} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

export function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  const map = {
    idle: ["text-slate-400", "Autoguardado activo"],
    saving: ["text-amber-600", "Guardando…"],
    saved: ["text-emerald-600", "Cambios guardados"],
    error: ["text-red-600", "Error al guardar"],
  } as const;
  const [cls, text] = map[status];
  return <span className={cn("text-xs font-medium", cls)}>{text}</span>;
}
