"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@db/index";
import {
  attendance,
  evaluationActivities,
  evaluationRecords,
  languageDiagnostics,
  materialDeliveries,
  mathDiagnostics,
  monthlyStats,
  students,
} from "@db/schema";
import { requireTeacher } from "../auth";
import {
  activitySchema,
  attendanceSchema,
  evaluationRecordSchema,
  languageDiagnosticSchema,
  materialSchema,
  mathDiagnosticSchema,
  monthlyStatSchema,
} from "../validations";
import type { FormState } from "../types";
import { str, zodState } from "./helpers";

type Result = { ok: true } | { ok: false; error: string };
const fail = (error = "Datos inválidos.") => ({ ok: false, error }) as const;

async function ownsStudent(teacherId: number, studentId: number) {
  const [row] = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, studentId), eq(students.teacherId, teacherId)));
  return !!row;
}

async function ownsActivity(teacherId: number, activityId: number) {
  const [row] = await db
    .select({ id: evaluationActivities.id })
    .from(evaluationActivities)
    .where(and(eq(evaluationActivities.id, activityId), eq(evaluationActivities.teacherId, teacherId)));
  return !!row;
}

// --- Módulo A: Asistencia --------------------------------------------------

export async function setAttendanceAction(input: unknown): Promise<Result> {
  const teacher = await requireTeacher();
  const parsed = attendanceSchema.safeParse(input);
  if (!parsed.success) return fail();
  const { studentId, fecha, estado } = parsed.data;
  if (!(await ownsStudent(teacher.id, studentId))) return fail("Estudiante no encontrado.");

  if (estado === null) {
    await db.delete(attendance).where(and(eq(attendance.studentId, studentId), eq(attendance.fecha, fecha)));
  } else {
    await db
      .insert(attendance)
      .values({ teacherId: teacher.id, studentId, fecha, estado })
      .onConflictDoUpdate({ target: [attendance.studentId, attendance.fecha], set: { estado } });
  }
  return { ok: true };
}

export async function saveMonthlyStatAction(input: unknown): Promise<Result> {
  const teacher = await requireTeacher();
  const parsed = monthlyStatSchema.safeParse(input);
  if (!parsed.success) return fail("Valores de matrícula inválidos.");
  const { anio, mes, ...counts } = parsed.data;

  await db
    .insert(monthlyStats)
    .values({ teacherId: teacher.id, anio, mes, ...counts })
    .onConflictDoUpdate({
      target: [monthlyStats.teacherId, monthlyStats.anio, monthlyStats.mes],
      set: counts,
    });
  return { ok: true };
}

// --- Módulo B: Evaluaciones ------------------------------------------------

export async function createActivityAction(_: FormState, fd: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const parsed = activitySchema.safeParse({
    momento: str(fd, "momento"),
    area: str(fd, "area"),
    actividad: str(fd, "actividad"),
    aprendizajeEsperado: str(fd, "aprendizajeEsperado"),
    indicador: str(fd, "indicador"),
    fecha: str(fd, "fecha"),
  });
  if (!parsed.success) return zodState(parsed.error);

  await db.insert(evaluationActivities).values({ ...parsed.data, teacherId: teacher.id });
  revalidatePath("/evaluaciones");
  return { ok: true, message: "Actividad creada." };
}

export async function deleteActivityAction(id: number) {
  const teacher = await requireTeacher();
  await db
    .delete(evaluationActivities)
    .where(and(eq(evaluationActivities.id, id), eq(evaluationActivities.teacherId, teacher.id)));
  revalidatePath("/evaluaciones");
}

export async function saveEvaluationRecordAction(input: unknown): Promise<Result> {
  const teacher = await requireTeacher();
  const parsed = evaluationRecordSchema.safeParse(input);
  if (!parsed.success) return fail();
  const { activityId, studentId, literal, observacion } = parsed.data;
  if (!(await ownsActivity(teacher.id, activityId)) || !(await ownsStudent(teacher.id, studentId))) {
    return fail("Registro no encontrado.");
  }

  await db
    .insert(evaluationRecords)
    .values({ activityId, studentId, literal, observacion })
    .onConflictDoUpdate({
      target: [evaluationRecords.activityId, evaluationRecords.studentId],
      set: { literal, observacion },
    });
  return { ok: true };
}

// --- Módulo C: Diagnóstico -------------------------------------------------

export async function saveLanguageDiagnosticAction(input: unknown): Promise<Result> {
  const teacher = await requireTeacher();
  const parsed = languageDiagnosticSchema.safeParse(input);
  if (!parsed.success) return fail();
  const { studentId, ...data } = parsed.data;
  if (!(await ownsStudent(teacher.id, studentId))) return fail("Estudiante no encontrado.");

  await db
    .insert(languageDiagnostics)
    .values({ studentId, ...data })
    .onConflictDoUpdate({ target: languageDiagnostics.studentId, set: data });
  return { ok: true };
}

export async function saveMathDiagnosticAction(input: unknown): Promise<Result> {
  const teacher = await requireTeacher();
  const parsed = mathDiagnosticSchema.safeParse(input);
  if (!parsed.success) return fail();
  const { studentId, ...data } = parsed.data;
  if (!(await ownsStudent(teacher.id, studentId))) return fail("Estudiante no encontrado.");

  await db
    .insert(mathDiagnostics)
    .values({ studentId, ...data })
    .onConflictDoUpdate({ target: mathDiagnostics.studentId, set: data });
  return { ok: true };
}

// --- Módulo D: Materiales --------------------------------------------------

export async function createMaterialAction(_: FormState, fd: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const parsed = materialSchema.safeParse({
    fecha: str(fd, "fecha"),
    item: str(fd, "item"),
    cantidad: str(fd, "cantidad"),
    entregadoPor: str(fd, "entregadoPor"),
    observaciones: str(fd, "observaciones"),
  });
  if (!parsed.success) return zodState(parsed.error);

  await db.insert(materialDeliveries).values({ ...parsed.data, teacherId: teacher.id });
  revalidatePath("/materiales");
  revalidatePath("/dashboard");
  return { ok: true, message: "Entrega registrada." };
}

export async function deleteMaterialAction(id: number) {
  const teacher = await requireTeacher();
  await db
    .delete(materialDeliveries)
    .where(and(eq(materialDeliveries.id, id), eq(materialDeliveries.teacherId, teacher.id)));
  revalidatePath("/materiales");
  revalidatePath("/dashboard");
}
