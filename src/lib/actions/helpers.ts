import type { ZodError } from "zod";
import type { FormState } from "../types";

export function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export function zodState(error: ZodError): FormState {
  return {
    error: "Revisa los campos marcados.",
    fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
  };
}

export const GENERIC_ERROR: FormState = {
  error: "Ocurrió un error inesperado. Intenta de nuevo.",
};
