import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@db/index";
import { attendance, monthlyStats } from "@db/schema";
import { requireTeacher } from "@/lib/auth";
import { getProfile, getStudents } from "@/lib/queries";
import { daysInMonth, isoDate, todayISO } from "@/lib/utils";
import { AttendanceGrid } from "./attendance-grid";

export const metadata = { title: "Asistencia" };

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ anio?: string; mes?: string }> }) {
  const teacher = await requireTeacher();
  const sp = await searchParams;
  const [ty, tm] = todayISO().split("-").map(Number);
  const anio = Math.min(2100, Math.max(2000, Number(sp.anio) || ty));
  const mes = Math.min(12, Math.max(1, Number(sp.mes) || tm));
  const from = isoDate(anio, mes, 1);
  const to = isoDate(anio, mes, daysInMonth(anio, mes));

  const [profile, list, marks, [stat]] = await Promise.all([
    getProfile(teacher.id),
    getStudents(teacher.id, true),
    db
      .select({ studentId: attendance.studentId, fecha: attendance.fecha, estado: attendance.estado })
      .from(attendance)
      .where(and(eq(attendance.teacherId, teacher.id), gte(attendance.fecha, from), lte(attendance.fecha, to))),
    db
      .select()
      .from(monthlyStats)
      .where(and(eq(monthlyStats.teacherId, teacher.id), eq(monthlyStats.anio, anio), eq(monthlyStats.mes, mes))),
  ]);

  const initialMarks: Record<string, "AS" | "IA"> = {};
  for (const m of marks) initialMarks[`${m.studentId}|${m.fecha}`] = m.estado as "AS" | "IA";

  return (
    <AttendanceGrid
      key={`${anio}-${mes}`}
      anio={anio}
      mes={mes}
      students={list}
      initialMarks={initialMarks}
      initialStat={{
        matriculaInicialV: stat?.matriculaInicialV ?? list.filter((s) => s.sexo === "V").length,
        matriculaInicialH: stat?.matriculaInicialH ?? list.filter((s) => s.sexo === "H").length,
        ingresosV: stat?.ingresosV ?? 0,
        ingresosH: stat?.ingresosH ?? 0,
        egresosV: stat?.egresosV ?? 0,
        egresosH: stat?.egresosH ?? 0,
      }}
      header={{
        docente: `${teacher.nombre} ${teacher.apellido}`,
        plantel: profile?.plantel ?? "",
        grado: profile?.grado ?? "",
        seccion: profile?.seccion ?? "",
        anoEscolar: profile?.anoEscolar ?? "",
      }}
    />
  );
}
