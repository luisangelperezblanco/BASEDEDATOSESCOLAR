"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@db/index";
import { passwordResetTokens, teacherProfiles, teachers } from "@db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "../auth";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "../validations";
import type { FormState } from "../types";
import { str, zodState } from "./helpers";

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    nombre: str(fd, "nombre"),
    apellido: str(fd, "apellido"),
    email: str(fd, "email"),
    password: str(fd, "password"),
    confirm: str(fd, "confirm"),
  });
  if (!parsed.success) return zodState(parsed.error);
  const { nombre, apellido, email, password } = parsed.data;

  const [existing] = await db.select({ id: teachers.id }).from(teachers).where(eq(teachers.email, email));
  if (existing) return { fieldErrors: { email: ["Ya existe una cuenta con este correo"] } };

  const passwordHash = await hashPassword(password);
  const [teacher] = await db
    .insert(teachers)
    .values({ nombre, apellido, email, passwordHash })
    .onConflictDoNothing()
    .returning({ id: teachers.id });
  if (!teacher) return { fieldErrors: { email: ["Ya existe una cuenta con este correo"] } };

  await db.insert(teacherProfiles).values({ teacherId: teacher.id });
  await createSession(teacher.id);
  redirect("/dashboard");
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: str(fd, "email"), password: str(fd, "password") });
  if (!parsed.success) return zodState(parsed.error);

  const [teacher] = await db.select().from(teachers).where(eq(teachers.email, parsed.data.email));
  if (!teacher || !(await verifyPassword(parsed.data.password, teacher.passwordHash))) {
    return { error: "Correo o contraseña incorrectos." };
  }
  await createSession(teacher.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function forgotPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = forgotSchema.safeParse({ email: str(fd, "email") });
  if (!parsed.success) return zodState(parsed.error);

  const neutral = "Si el correo está registrado, se generó un enlace de recuperación válido por 1 hora.";
  const [teacher] = await db.select({ id: teachers.id }).from(teachers).where(eq(teachers.email, parsed.data.email));
  if (!teacher) return { ok: true, message: neutral };

  const token = randomBytes(32).toString("hex");
  await db.insert(passwordResetTokens).values({
    teacherId: teacher.id,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  const link = `/reset-password?token=${token}`;
  // Sin proveedor de correo configurado, el enlace solo se muestra fuera de producción.
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, message: `${neutral} Enlace (modo desarrollo): ${link}` };
  }
  console.log(`[sonya] Enlace de recuperación generado para el docente ${teacher.id}`);
  return { ok: true, message: neutral };
}

export async function resetPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({
    token: str(fd, "token"),
    password: str(fd, "password"),
    confirm: str(fd, "confirm"),
  });
  if (!parsed.success) return zodState(parsed.error);

  const [row] = await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.tokenHash, sha256(parsed.data.token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .returning({ teacherId: passwordResetTokens.teacherId });
  if (!row) return { error: "El enlace es inválido o ha expirado. Solicita uno nuevo." };

  await db
    .update(teachers)
    .set({ passwordHash: await hashPassword(parsed.data.password) })
    .where(eq(teachers.id, row.teacherId));
  await createSession(row.teacherId);
  redirect("/dashboard");
}
