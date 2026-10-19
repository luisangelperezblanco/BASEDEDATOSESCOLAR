"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@db/index";
import { students } from "@db/schema";
import { requireTeacher } from "../auth";
import { studentSchema } from "../validations";
import type { FormState } from "../types";
import { str, zodState } from "./helpers";

function parse(fd: FormData) {
  return studentSchema.safeParse({
    nombres: str(fd, "nombres"),
    apellidos: str(fd, "apellidos"),
    edad: str(fd, "edad"),
    sexo: str(fd, "sexo"),
    condicion: str(fd, "condicion"),
    activo: fd.get("activo") === "on",
  });
}

export async function saveStudentAction(_: FormState, fd: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const parsed = parse(fd);
  if (!parsed.success) return zodState(parsed.error);

  const id = Number(str(fd, "id"));
  if (id) {
    const updated = await db
      .update(students)
      .set(parsed.data)
      .where(and(eq(students.id, id), eq(students.teacherId, teacher.id)))
      .returning({ id: students.id });
    if (!updated.length) return { error: "Estudiante no encontrado." };
  } else {
    await db.insert(students).values({ ...parsed.data, teacherId: teacher.id });
  }

  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Estudiante actualizado." : "Estudiante agregado." };
}

export async function deleteStudentAction(id: number) {
  const teacher = await requireTeacher();
  await db.delete(students).where(and(eq(students.id, id), eq(students.teacherId, teacher.id)));
  revalidatePath("/", "layout");
}
