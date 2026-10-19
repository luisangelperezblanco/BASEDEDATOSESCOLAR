"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveMonthlyStatAction, setAttendanceAction } from "@/lib/actions/modules";
import { MESES } from "@/lib/constants";
import type { StudentDTO } from "@/lib/types";
import { cn, daysInMonth, isoDate, pct, weekday } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { PrintButton } from "@/components/print-button";
import { SaveIndicator } from "@/components/ui";

type Mark = "AS" | "IA";
type Stat = {
  matriculaInicialV: number;
  matriculaInicialH: number;
  ingresosV: number;
  ingresosH: number;
  egresosV: number;
  egresosH: number;
};
type Header = { docente: string; plantel: string; grado: string; seccion: string; anoEscolar: string };

const DIAS = ["D", "L", "M", "M", "J", "V", "S"];

export function AttendanceGrid({
  anio,
  mes,
  students,
  initialMarks,
  initialStat,
  header,
}: {
  anio: number;
  mes: number;
  students: StudentDTO[];
  initialMarks: Record<string, Mark>;
  initialStat: Stat;
  header: Header;
}) {
  const router = useRouter();
  const [marks, setMarks] = useState(initialMarks);
  const [stat, setStat] = useState(initialStat);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const inflight = useRef(0);

  // Días hábiles (lunes a viernes) del mes.
  const days = useMemo(() => {
    const out: { dia: number; iso: string; wd: number }[] = [];
    for (let d = 1; d <= daysInMonth(anio, mes); d++) {
      const iso = isoDate(anio, mes, d);
      const wd = weekday(iso);
      if (wd !== 0 && wd !== 6) out.push({ dia: d, iso, wd });
    }
    return out;
  }, [anio, mes]);

  async function track<T extends { ok: boolean }>(p: Promise<T>) {
    inflight.current++;
    setStatus("saving");
    try {
      const r = await p;
      if (!r.ok) throw new Error();
      if (--inflight.current === 0) setStatus("saved");
      return true;
    } catch {
      inflight.current--;
      setStatus("error");
      return false;
    }
  }

  async function toggle(studentId: number, iso: string) {
    const key = `${studentId}|${iso}`;
    const prev = marks[key];
    const next: Mark | null = prev === undefined ? "AS" : prev === "AS" ? "IA" : null;
    setMarks((m) => {
      const copy = { ...m };
      if (next) copy[key] = next;
      else delete copy[key];
      return copy;
    });
    const ok = await track(setAttendanceAction({ studentId, fecha: iso, estado: next }));
    if (!ok) {
      setMarks((m) => {
        const copy = { ...m };
        if (prev) copy[key] = prev;
        else delete copy[key];
        return copy;
      });
    }
  }

  function markAllPresent(iso: string) {
    for (const s of students) if (!marks[`${s.id}|${iso}`]) void toggle(s.id, iso);
  }

  function saveStat(next: Stat) {
    setStat(next);
    void track(saveMonthlyStatAction({ anio, mes, ...next }));
  }

  function go(delta: number) {
    let m = mes + delta;
    let y = anio;
    if (m < 1) (m = 12), y--;
    if (m > 12) (m = 1), y++;
    router.push(`/asistencia?anio=${y}&mes=${m}`);
  }

  // --- Cálculos ------------------------------------------------------------
  const sexOf = new Map(students.map((s) => [s.id, s.sexo]));
  const daily = days.map(({ iso }) => {
    let v = 0, h = 0, ia = 0;
    for (const s of students) {
      const m = marks[`${s.id}|${iso}`];
      if (m === "AS") sexOf.get(s.id) === "V" ? v++ : h++;
      if (m === "IA") ia++;
    }
    return { v, h, total: v + h, ia, registrado: v + h + ia > 0 };
  });
  const diasRegistrados = daily.filter((d) => d.registrado).length;
  const totalAS = daily.reduce((a, d) => a + d.total, 0);
  const totalIA = daily.reduce((a, d) => a + d.ia, 0);
  const asV = daily.reduce((a, d) => a + d.v, 0);
  const asH = daily.reduce((a, d) => a + d.h, 0);
  const promedio = (n: number) => (diasRegistrados ? Math.round((n / diasRegistrados) * 10) / 10 : 0);

  const sumaV = stat.matriculaInicialV + stat.ingresosV;
  const sumaH = stat.matriculaInicialH + stat.ingresosH;
  const finalV = sumaV - stat.egresosV;
  const finalH = sumaH - stat.egresosH;

  const edades = [...new Set(students.map((s) => s.edad))].sort((a, b) => a - b);
  const byAge = (list: StudentDTO[]) =>
    edades.map((e) => ({
      edad: e,
      v: list.filter((s) => s.edad === e && s.sexo === "V").length,
      h: list.filter((s) => s.edad === e && s.sexo === "H").length,
    }));
  const repitientes = students.filter((s) => s.condicion === "REPITIENTE");

  return (
    <>
      <PageHeader
        title="A · Asistencia mensual"
        subtitle="Clic en una celda: AS → IA → sin marcar. Se guarda automáticamente."
        actions={
          <>
            <SaveIndicator status={status} />
            <PrintButton />
          </>
        }
      />

      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <button className="btn-secondary px-3" onClick={() => go(-1)} aria-label="Mes anterior">
          ‹
        </button>
        <select className="input w-40" value={mes} onChange={(e) => router.push(`/asistencia?anio=${anio}&mes=${e.target.value}`)}>
          {MESES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="input w-24"
          defaultValue={anio}
          min={2000}
          max={2100}
          onBlur={(e) => {
            const y = Number(e.target.value);
            if (y && y !== anio) router.push(`/asistencia?anio=${y}&mes=${mes}`);
          }}
        />
        <button className="btn-secondary px-3" onClick={() => go(1)} aria-label="Mes siguiente">
          ›
        </button>
        <span className="ml-2 inline-flex items-center gap-3 text-xs text-slate-500">
          <span className="badge bg-emerald-100 text-emerald-700">AS</span> Asistente
          <span className="badge bg-red-100 text-red-700">IA</span> Inasistente
        </span>
      </div>

      <div className="mb-4 hidden text-sm print:block">
        <p className="text-center text-base font-bold uppercase">
          Control de asistencia · {MESES[mes - 1]} {anio}
        </p>
        <p>
          Plantel: {header.plantel} · Grado: {header.grado} · Sección: {header.seccion} · Año escolar: {header.anoEscolar} ·
          Docente: {header.docente}
        </p>
      </div>

      {students.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">No hay estudiantes activos. Agrégalos en el módulo Estudiantes.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table text-xs">
            <thead>
              <tr>
                <th rowSpan={2} className="w-8">N°</th>
                <th rowSpan={2} className="min-w-[200px]">Apellidos y nombres</th>
                <th rowSpan={2} className="w-8 text-center">S</th>
                {days.map((d) => (
                  <th key={d.iso} className="w-8 px-0 text-center">{DIAS[d.wd]}</th>
                ))}
                <th rowSpan={2} className="text-center">AS</th>
                <th rowSpan={2} className="text-center">IA</th>
                <th rowSpan={2} className="text-center">%</th>
              </tr>
              <tr>
                {days.map((d) => (
                  <th key={d.iso} className="px-0 text-center">
                    <button className="no-print w-full hover:text-brand-600" title="Marcar todos AS" onClick={() => markAllPresent(d.iso)}>
                      {d.dia}
                    </button>
                    <span className="hidden print:inline">{d.dia}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                let as = 0, ia = 0;
                for (const d of days) {
                  const m = marks[`${s.id}|${d.iso}`];
                  if (m === "AS") as++;
                  if (m === "IA") ia++;
                }
                return (
                  <tr key={s.id}>
                    <td className="text-center">{i + 1}</td>
                    <td className="whitespace-nowrap font-medium">
                      {s.apellidos}, {s.nombres}
                    </td>
                    <td className="text-center">{s.sexo}</td>
                    {days.map((d) => {
                      const m = marks[`${s.id}|${d.iso}`];
                      return (
                        <td key={d.iso} className="p-0 text-center">
                          <button
                            onClick={() => toggle(s.id, d.iso)}
                            className={cn(
                              "h-7 w-8 text-[10px] font-bold transition",
                              m === "AS" && "bg-emerald-100 text-emerald-700",
                              m === "IA" && "bg-red-100 text-red-700",
                              !m && "hover:bg-slate-100",
                            )}
                          >
                            {m ?? ""}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-center font-semibold">{as}</td>
                    <td className="text-center font-semibold">{ia}</td>
                    <td className="text-center">{pct(as, as + ia)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-semibold">
              {(["v", "h", "total"] as const).map((k) => (
                <tr key={k}>
                  <td colSpan={3} className="text-right">
                    {k === "v" ? "Asistentes V" : k === "h" ? "Asistentes H" : "Total asistentes"}
                  </td>
                  {daily.map((d, i) => (
                    <td key={days[i].iso} className="text-center">{d.registrado ? d[k] : ""}</td>
                  ))}
                  <td className="text-center">{k === "v" ? asV : k === "h" ? asH : totalAS}</td>
                  <td className="text-center">{k === "total" ? totalIA : ""}</td>
                  <td />
                </tr>
              ))}
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-900">Matrícula del mes</h2>
          <div className="overflow-x-auto">
            <table className="table text-center">
              <thead>
                <tr>
                  <th />
                  <th className="text-center">Inicial</th>
                  <th className="text-center">Ingresos</th>
                  <th className="text-center">Suma</th>
                  <th className="text-center">Egresos</th>
                  <th className="text-center">Final</th>
                </tr>
              </thead>
              <tbody>
                {(["V", "H"] as const).map((sx) => (
                  <tr key={sx}>
                    <td className="font-semibold">{sx}</td>
                    {(["matriculaInicial", "ingresos"] as const).map((f) => (
                      <td key={f} className="p-1">
                        <NumberCell value={stat[`${f}${sx}`]} onCommit={(n) => saveStat({ ...stat, [`${f}${sx}`]: n })} />
                      </td>
                    ))}
                    <td className="font-semibold">{sx === "V" ? sumaV : sumaH}</td>
                    <td className="p-1">
                      <NumberCell value={stat[`egresos${sx}`]} onCommit={(n) => saveStat({ ...stat, [`egresos${sx}`]: n })} />
                    </td>
                    <td className="font-semibold">{sx === "V" ? finalV : finalH}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td>T</td>
                  <td>{stat.matriculaInicialV + stat.matriculaInicialH}</td>
                  <td>{stat.ingresosV + stat.ingresosH}</td>
                  <td>{sumaV + sumaH}</td>
                  <td>{stat.egresosV + stat.egresosH}</td>
                  <td>{finalV + finalH}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Resumen</h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Días hábiles del mes", days.length],
              ["Días registrados", diasRegistrados],
              ["Promedio asistencia V", promedio(asV)],
              ["Promedio asistencia H", promedio(asH)],
              ["Promedio asistencia total", promedio(totalAS)],
              ["% de asistencia general", `${pct(totalAS, totalAS + totalIA)}%`],
              ["% sobre matrícula final", `${pct(promedio(totalAS), finalV + finalH)}%`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 pb-1">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-semibold text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <AgeTable title="Distribución por edad y sexo" rows={byAge(students)} />
        <AgeTable title="Repitientes por edad y sexo" rows={byAge(repitientes).filter((r) => r.v + r.h > 0)} />
      </div>
    </>
  );
}

function NumberCell({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      max={999}
      defaultValue={value}
      className="input w-20 py-1 text-center"
      onBlur={(e) => {
        const n = Math.max(0, Math.min(999, Math.floor(Number(e.target.value) || 0)));
        e.target.value = String(n);
        if (n !== value) onCommit(n);
      }}
    />
  );
}

function AgeTable({ title, rows }: { title: string; rows: { edad: number; v: number; h: number }[] }) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">Sin datos.</p>
      ) : (
        <table className="table text-center">
          <thead>
            <tr>
              <th className="text-center">Edad</th>
              <th className="text-center">V</th>
              <th className="text-center">H</th>
              <th className="text-center">T</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.edad}>
                <td>{r.edad} años</td>
                <td>{r.v}</td>
                <td>{r.h}</td>
                <td className="font-semibold">{r.v + r.h}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-bold">
              <td>Total</td>
              <td>{rows.reduce((a, r) => a + r.v, 0)}</td>
              <td>{rows.reduce((a, r) => a + r.h, 0)}</td>
              <td>{rows.reduce((a, r) => a + r.v + r.h, 0)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </section>
  );
}
