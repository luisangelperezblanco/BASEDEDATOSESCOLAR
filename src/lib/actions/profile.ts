"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@db/index";
import { teacherProfiles, teachers } from "@db/schema";
import { requireTeacher } from "../auth";
import { profileSchema } from "../validations";
import type { FormState } from "../types";
import { str, zodState } from "./helpers";

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const parsed = profileSchema.safeParse(
    Object.fromEntries(
      ["nombre", "apellido", "plantel", "grado", "seccion", "anoEscolar", "dependencia", "localidad"].map(
        (k) => [k, str(fd, k)],
      ),
    ),
  );
  if (!parsed.success) return zodState(parsed.error);
  const { nombre, apellido, ...profile } = parsed.data;

  await db.update(teachers).set({ nombre, apellido }).where(eq(teachers.id, teacher.id));
  await db
    .insert(teacherProfiles)
    .values({ teacherId: teacher.id, ...profile })
    .onConflictDoUpdate({
      target: teacherProfiles.teacherId,
      set: { ...profile, updatedAt: sql`now()` },
    });

  revalidatePath("/", "layout");
  return { ok: true, message: "Datos guardados correctamente." };
}
