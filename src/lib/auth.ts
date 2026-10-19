import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db } from "@db/index";
import { appSecrets, teachers } from "@db/schema";

export const SESSION_COOKIE = "sonya_session";
const SESSION_DAYS = 7;

let secretPromise: Promise<Uint8Array> | null = null;

/**
 * Clave de firma de sesiones. Usa AUTH_SECRET si está definida; si no, genera una clave
 * aleatoria una única vez y la guarda en la base de datos para que sea estable entre
 * instancias y despliegues.
 */
function getSecret() {
  if (!secretPromise) {
    secretPromise = (async () => {
      const fromEnv = process.env.AUTH_SECRET;
      if (fromEnv && fromEnv.length >= 32) return new TextEncoder().encode(fromEnv);

      await db
        .insert(appSecrets)
        .values({ key: "jwt", value: randomBytes(48).toString("hex") })
        .onConflictDoNothing();
      const [row] = await db.select().from(appSecrets).where(eq(appSecrets.key, "jwt"));
      return new TextEncoder().encode(row.value);
    })().catch((err) => {
      secretPromise = null;
      throw err;
    });
  }
  return secretPromise;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(teacherId: number) {
  const token = await new SignJWT({ sub: String(teacherId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(await getSecret());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const getCurrentTeacher = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await getSecret());
    const id = Number(payload.sub);
    if (!id) return null;
    const [teacher] = await db
      .select({
        id: teachers.id,
        email: teachers.email,
        nombre: teachers.nombre,
        apellido: teachers.apellido,
      })
      .from(teachers)
      .where(eq(teachers.id, id));
    return teacher ?? null;
  } catch {
    return null;
  }
});

export async function requireTeacher() {
  const teacher = await getCurrentTeacher();
  if (!teacher) redirect("/login");
  return teacher;
}
