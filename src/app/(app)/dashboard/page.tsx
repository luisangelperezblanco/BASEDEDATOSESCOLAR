import Link from "next/link";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@db/index";
import { attendance, evaluationActivities, materialDeliveries } from "@db/schema";
import { requireTeacher } from "@/lib/auth";
import { getProfile, getStudents } from "@/lib/queries";
import { MESES } from "@/lib/constants";
import { daysInMonth, isoDate, pct, todayISO } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { BoxIcon, CalendarIcon, ChartIcon, ClipboardIcon, UsersIcon } from "@/components/icons";

export const metadata = { title: "Panel" };

export default async function DashboardPage() {
  const teacher = await requireTeacher();
  const today = todayISO();
  const [anio, mes] = today.split("-").map(Number);
  const from = isoDate(anio, mes, 1);
  const to = isoDate(anio, mes, daysInMonth(anio, mes));

  const [profile, list, att, [acts], [mats]] = await Promise.all([
    getProfile(teacher.id),
    getStudents(teacher.id, true),
    db
      .select({ estado: attendance.estado, n: count() })
      .from(attendance)
      .where(and(eq(attendance.teacherId, teacher.id), gte(attendance.fecha, from), lte(attendance.fecha, to)))
      .groupBy(attendance.estado),
    db.select({ n: count() }).from(evaluationActivities).where(eq(evaluationActivities.teacherId, teacher.id)),
    db
      .select({ n: sql<number>`coalesce(sum(${materialDeliveries.cantidad}), 0)::int` })
      .from(materialDeliveries)
      .where(eq(materialDeliveries.teacherId, teacher.id)),
  ]);

  const as = att.find((a) => a.estado === "AS")?.n ?? 0;
  const ia = att.find((a) => a.estado === "IA")?.n ?? 0;
  const varones = list.filter((s) => s.sexo === "V").length;

  const stats = [
    { label: "Estudiantes activos", value: list.length, hint: `${varones} V · ${list.length - varones} H` },
    { label: `Asistencia ${MESES[mes - 1].toLowerCase()}`, value: `${pct(as, as + ia)}%`, hint: `${as} AS · ${ia} IA` },
    { label: "Actividades evaluadas", value: acts.n, hint: "Módulo B" },
    { label: "Insumos recibidos", value: mats.n, hint: "Unidades totales" },
  ];

  const modules = [
    { href: "/asistencia", title: "A · Asistencia mensual", desc: "Grilla diaria AS/IA, matrícula y resumen estadístico.", icon: CalendarIcon },
    { href: "/evaluaciones", title: "B · Evaluaciones", desc: "Actividades por momento y área con literales.", icon: ClipboardIcon },
    { href: "/diagnostico", title: "C · Diagnóstico", desc: "Lenguaje y matemática con niveles I / C / RR.", icon: ChartIcon },
    { href: "/materiales", title: "D · Materiales", desc: "Entregas de insumos de limpieza y colaboradores.", icon: BoxIcon },
    { href: "/estudiantes", title: "Estudiantes", desc: "Lista única reutilizada en todos los módulos.", icon: UsersIcon },
  ];

  return (
    <>
      <PageHeader
        title={`Hola, ${teacher.nombre}`}
        subtitle={
          profile?.plantel
            ? `${profile.plantel}${profile.grado ? ` · ${profile.grado}` : ""}${profile.seccion ? ` "${profile.seccion}"` : ""}${profile.anoEscolar ? ` · Año escolar ${profile.anoEscolar}` : ""}`
            : "Completa los datos de tu plantel en Configuración."
        }
      />

      {!profile?.plantel && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aún no has configurado tu plantel, grado y sección. Estos datos aparecen en los reportes impresos.
          <Link href="/configuracion" className="btn-secondary">
            Configurar
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Módulos</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ href, title, desc, icon: Icon }) => (
          <Link key={href} href={href} className="card group flex gap-4 p-5 transition hover:border-brand-300 hover:shadow-md">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
              <Icon />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
