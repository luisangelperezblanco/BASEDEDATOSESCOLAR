import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@db/index";
import { students, teacherProfiles } from "@db/schema";

export async function getProfile(teacherId: number) {
  const [profile] = await db.select().from(teacherProfiles).where(eq(teacherProfiles.teacherId, teacherId));
  return profile ?? null;
}

export function getStudents(teacherId: number, onlyActive = false) {
  return db
    .select({
      id: students.id,
      nombres: students.nombres,
      apellidos: students.apellidos,
      edad: students.edad,
      sexo: students.sexo,
      condicion: students.condicion,
      activo: students.activo,
    })
    .from(students)
    .where(onlyActive ? and(eq(students.teacherId, teacherId), eq(students.activo, true)) : eq(students.teacherId, teacherId))
    .orderBy(asc(students.apellidos), asc(students.nombres));
}
