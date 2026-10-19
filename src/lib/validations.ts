import { z } from "zod";
import {
  AREAS,
  CONDICIONES,
  ESTILOS_ESCRITURA,
  LITERALES,
  MATERIALES,
  MOMENTOS,
  NIVELES_DIAGNOSTICO,
  SEXOS,
} from "./constants";

const req = (label: string) => z.string().trim().min(1, `${label} es obligatorio`);
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z
  .object({
    nombre: req("El nombre").max(80),
    apellido: req("El apellido").max(80),
    email: z.string().trim().toLowerCase().email("Correo inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
});

export const resetSchema = z
  .object({
    token: z.string().min(10, "Enlace inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export const profileSchema = z.object({
  nombre: req("El nombre").max(80),
  apellido: req("El apellido").max(80),
  plantel: z.string().trim().max(150),
  grado: z.string().trim().max(40),
  seccion: z.string().trim().max(20),
  anoEscolar: z.string().trim().max(20),
  dependencia: z.string().trim().max(80),
  localidad: z.string().trim().max(120),
});

export const studentSchema = z.object({
  nombres: req("Los nombres").max(80),
  apellidos: req("Los apellidos").max(80),
  edad: z.coerce.number().int("Edad inválida").min(3, "Edad mínima 3").max(25, "Edad máxima 25"),
  sexo: z.enum(SEXOS, { message: "Selecciona el sexo" }),
  condicion: z.enum(CONDICIONES, { message: "Selecciona la condición" }),
  activo: z.boolean(),
});

export const attendanceSchema = z.object({
  studentId: z.number().int().positive(),
  fecha,
  estado: z.enum(["AS", "IA"]).nullable(),
});

const count = z.coerce.number().int().min(0).max(999);
export const monthlyStatSchema = z.object({
  anio: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12),
  matriculaInicialV: count,
  matriculaInicialH: count,
  ingresosV: count,
  ingresosH: count,
  egresosV: count,
  egresosH: count,
});

export const activitySchema = z.object({
  momento: z.enum(MOMENTOS, { message: "Selecciona el momento" }),
  area: z.enum(AREAS, { message: "Selecciona el área" }),
  actividad: req("La actividad").max(200),
  aprendizajeEsperado: z.string().trim().max(500),
  indicador: z.string().trim().max(500),
  fecha,
});

export const evaluationRecordSchema = z.object({
  activityId: z.number().int().positive(),
  studentId: z.number().int().positive(),
  literal: z.enum(LITERALES).nullable(),
  observacion: z.string().trim().max(300),
});

const nivel = z.enum(NIVELES_DIAGNOSTICO).nullable();
export const languageDiagnosticSchema = z.object({
  studentId: z.number().int().positive(),
  lectura: nivel,
  comprension: nivel,
  escrituraNivel: nivel,
  escrituraEstilo: z.enum(ESTILOS_ESCRITURA).nullable(),
  observaciones: z.string().trim().max(300),
});

export const mathDiagnosticSchema = z.object({
  studentId: z.number().int().positive(),
  adicion: nivel,
  sustraccion: nivel,
  series: nivel,
  resolucion: nivel,
  observaciones: z.string().trim().max(300),
});

export const materialSchema = z.object({
  fecha,
  item: z.enum(MATERIALES, { message: "Selecciona el insumo" }),
  cantidad: z.coerce.number().int().min(1, "Cantidad mínima 1").max(9999),
  entregadoPor: z.string().trim().max(120),
  observaciones: z.string().trim().max(300),
});
