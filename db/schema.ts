import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Valores controlados (sexo, condición, literales, etc.) se guardan como texto y se
// validan con Zod en src/lib/constants.ts + validations.ts.

// ---------------------------------------------------------------------------
// Autenticación y configuración
// ---------------------------------------------------------------------------

export const teachers = pgTable("teachers", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nombre: text().notNull(),
  apellido: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teacherProfiles = pgTable("teacher_profiles", {
  id: serial().primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .unique()
    .references(() => teachers.id, { onDelete: "cascade" }),
  plantel: text().notNull().default(""),
  grado: text().notNull().default(""),
  seccion: text().notNull().default(""),
  anoEscolar: text("ano_escolar").notNull().default(""),
  dependencia: text().notNull().default(""),
  localidad: text().notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial().primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Secretos de la aplicación (p. ej. clave de firma JWT si no se define AUTH_SECRET).
export const appSecrets = pgTable("app_secrets", {
  key: text().primaryKey(),
  value: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Estudiantes (lista única por docente)
// ---------------------------------------------------------------------------

export const students = pgTable(
  "students",
  {
    id: serial().primaryKey(),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    nombres: text().notNull(),
    apellidos: text().notNull(),
    edad: integer().notNull(),
    sexo: text().notNull(), // V | H
    condicion: text().notNull().default("REGULAR"),
    activo: boolean().notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("students_teacher_idx").on(t.teacherId)],
);

// ---------------------------------------------------------------------------
// Módulo A — Asistencia
// ---------------------------------------------------------------------------

export const attendance = pgTable(
  "attendance",
  {
    id: serial().primaryKey(),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    fecha: date().notNull(),
    estado: text().notNull(), // AS | IA
  },
  (t) => [
    uniqueIndex("attendance_student_fecha_uq").on(t.studentId, t.fecha),
    index("attendance_teacher_fecha_idx").on(t.teacherId, t.fecha),
  ],
);

export const monthlyStats = pgTable(
  "monthly_stats",
  {
    id: serial().primaryKey(),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    anio: integer().notNull(),
    mes: integer().notNull(), // 1-12
    matriculaInicialV: integer("matricula_inicial_v").notNull().default(0),
    matriculaInicialH: integer("matricula_inicial_h").notNull().default(0),
    ingresosV: integer("ingresos_v").notNull().default(0),
    ingresosH: integer("ingresos_h").notNull().default(0),
    egresosV: integer("egresos_v").notNull().default(0),
    egresosH: integer("egresos_h").notNull().default(0),
  },
  (t) => [uniqueIndex("monthly_stats_teacher_mes_uq").on(t.teacherId, t.anio, t.mes)],
);

// ---------------------------------------------------------------------------
// Módulo B — Evaluaciones
// ---------------------------------------------------------------------------

export const evaluationActivities = pgTable(
  "evaluation_activities",
  {
    id: serial().primaryKey(),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    momento: text().notNull(),
    area: text().notNull(),
    actividad: text().notNull(),
    aprendizajeEsperado: text("aprendizaje_esperado").notNull().default(""),
    indicador: text().notNull().default(""),
    fecha: date().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("evaluation_activities_teacher_idx").on(t.teacherId)],
);

export const evaluationRecords = pgTable(
  "evaluation_records",
  {
    id: serial().primaryKey(),
    activityId: integer("activity_id")
      .notNull()
      .references(() => evaluationActivities.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    literal: text(),
    observacion: text().notNull().default(""),
  },
  (t) => [uniqueIndex("evaluation_records_activity_student_uq").on(t.activityId, t.studentId)],
);

// ---------------------------------------------------------------------------
// Módulo C — Diagnóstico
// ---------------------------------------------------------------------------

export const languageDiagnostics = pgTable("language_diagnostics", {
  id: serial().primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
  lectura: text(),
  comprension: text(),
  escrituraNivel: text("escritura_nivel"),
  escrituraEstilo: text("escritura_estilo"),
  observaciones: text().notNull().default(""),
});

export const mathDiagnostics = pgTable("math_diagnostics", {
  id: serial().primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
  adicion: text(),
  sustraccion: text(),
  series: text(),
  resolucion: text(),
  observaciones: text().notNull().default(""),
});

// ---------------------------------------------------------------------------
// Módulo D — Materiales
// ---------------------------------------------------------------------------

export const materialDeliveries = pgTable(
  "material_deliveries",
  {
    id: serial().primaryKey(),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    fecha: date().notNull(),
    item: text().notNull(),
    cantidad: integer().notNull(),
    entregadoPor: text("entregado_por").notNull().default(""),
    observaciones: text().notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("material_deliveries_teacher_idx").on(t.teacherId)],
);
