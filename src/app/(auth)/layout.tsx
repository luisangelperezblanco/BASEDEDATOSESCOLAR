import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/lib/auth";
import { LogoMark } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentTeacher()) redirect("/dashboard");
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <LogoMark className="h-11 w-11" />
          <span className="text-xl font-bold">Sonya</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Tu aula, organizada sin hojas de cálculo.</h2>
          <p className="mt-4 text-brand-100">
            Asistencia mensual, evaluaciones cualitativas, diagnósticos y control de materiales en un solo lugar.
          </p>
        </div>
        <p className="relative text-sm text-brand-200">Sistema Web de Gestión Escolar y Control Docente</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark />
            <span className="text-lg font-bold">Sonya</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
