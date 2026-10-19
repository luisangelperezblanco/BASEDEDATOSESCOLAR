CREATE TABLE "app_secrets" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY,
	"teacher_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"fecha" date NOT NULL,
	"estado" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_activities" (
	"id" serial PRIMARY KEY,
	"teacher_id" integer NOT NULL,
	"momento" text NOT NULL,
	"area" text NOT NULL,
	"actividad" text NOT NULL,
	"aprendizaje_esperado" text DEFAULT '' NOT NULL,
	"indicador" text DEFAULT '' NOT NULL,
	"fecha" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_records" (
	"id" serial PRIMARY KEY,
	"activity_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"literal" text,
	"observacion" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "language_diagnostics" (
	"id" serial PRIMARY KEY,
	"student_id" integer NOT NULL UNIQUE,
	"lectura" text,
	"comprension" text,
	"escritura_nivel" text,
	"escritura_estilo" text,
	"observaciones" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_deliveries" (
	"id" serial PRIMARY KEY,
	"teacher_id" integer NOT NULL,
	"fecha" date NOT NULL,
	"item" text NOT NULL,
	"cantidad" integer NOT NULL,
	"entregado_por" text DEFAULT '' NOT NULL,
	"observaciones" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "math_diagnostics" (
	"id" serial PRIMARY KEY,
	"student_id" integer NOT NULL UNIQUE,
	"adicion" text,
	"sustraccion" text,
	"series" text,
	"resolucion" text,
	"observaciones" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_stats" (
	"id" serial PRIMARY KEY,
	"teacher_id" integer NOT NULL,
	"anio" integer NOT NULL,
	"mes" integer NOT NULL,
	"matricula_inicial_v" integer DEFAULT 0 NOT NULL,
	"matricula_inicial_h" integer DEFAULT 0 NOT NULL,
	"ingresos_v" integer DEFAULT 0 NOT NULL,
	"ingresos_h" integer DEFAULT 0 NOT NULL,
	"egresos_v" integer DEFAULT 0 NOT NULL,
	"egresos_h" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY,
	"teacher_id" integer NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY,
	"teacher_id" integer NOT NULL,
	"nombres" text NOT NULL,
	"apellidos" text NOT NULL,
	"edad" integer NOT NULL,
	"sexo" text NOT NULL,
	"condicion" text DEFAULT 'REGULAR' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"id" serial PRIMARY KEY,
	"teacher_id" integer NOT NULL UNIQUE,
	"plantel" text DEFAULT '' NOT NULL,
	"grado" text DEFAULT '' NOT NULL,
	"seccion" text DEFAULT '' NOT NULL,
	"ano_escolar" text DEFAULT '' NOT NULL,
	"dependencia" text DEFAULT '' NOT NULL,
	"localidad" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_student_fecha_uq" ON "attendance" ("student_id","fecha");--> statement-breakpoint
CREATE INDEX "attendance_teacher_fecha_idx" ON "attendance" ("teacher_id","fecha");--> statement-breakpoint
CREATE INDEX "evaluation_activities_teacher_idx" ON "evaluation_activities" ("teacher_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evaluation_records_activity_student_uq" ON "evaluation_records" ("activity_id","student_id");--> statement-breakpoint
CREATE INDEX "material_deliveries_teacher_idx" ON "material_deliveries" ("teacher_id");--> statement-breakpoint
CREATE UNIQUE INDEX "monthly_stats_teacher_mes_uq" ON "monthly_stats" ("teacher_id","anio","mes");--> statement-breakpoint
CREATE INDEX "students_teacher_idx" ON "students" ("teacher_id");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluation_activities" ADD CONSTRAINT "evaluation_activities_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluation_records" ADD CONSTRAINT "evaluation_records_activity_id_evaluation_activities_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "evaluation_activities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluation_records" ADD CONSTRAINT "evaluation_records_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "language_diagnostics" ADD CONSTRAINT "language_diagnostics_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "material_deliveries" ADD CONSTRAINT "material_deliveries_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "math_diagnostics" ADD CONSTRAINT "math_diagnostics_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monthly_stats" ADD CONSTRAINT "monthly_stats_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_teacher_id_teachers_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;