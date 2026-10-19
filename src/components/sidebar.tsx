"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import {
  BoxIcon,
  CalendarIcon,
  ChartIcon,
  ClipboardIcon,
  HomeIcon,
  LogoMark,
  LogoutIcon,
  MenuIcon,
  SettingsIcon,
  UsersIcon,
} from "./icons";

const NAV = [
  { href: "/dashboard", label: "Panel", icon: HomeIcon },
  { href: "/estudiantes", label: "Estudiantes", icon: UsersIcon },
  { href: "/asistencia", label: "A · Asistencia", icon: CalendarIcon },
  { href: "/evaluaciones", label: "B · Evaluaciones", icon: ClipboardIcon },
  { href: "/diagnostico", label: "C · Diagnóstico", icon: ChartIcon },
  { href: "/materiales", label: "D · Materiales", icon: BoxIcon },
  { href: "/configuracion", label: "Configuración", icon: SettingsIcon },
];

export function Sidebar({ name, plantel }: { name: string; plantel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <span className="font-bold">Sonya</span>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="btn-secondary px-2" aria-label="Menú">
          <MenuIcon />
        </button>
      </div>

      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <LogoMark />
          <div>
            <p className="font-bold leading-tight text-slate-900">Sonya</p>
            <p className="text-xs text-slate-500">Gestión escolar</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
          <p className="truncate text-xs text-slate-500">{plantel || "Plantel sin configurar"}</p>
          <form action={logoutAction} className="mt-3">
            <button className="btn-secondary w-full">
              <LogoutIcon className="h-4 w-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      {open && <div className="no-print fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
