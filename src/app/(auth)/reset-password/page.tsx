import Link from "next/link";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
      <p className="mt-1 text-sm text-slate-500">Elige una contraseña de al menos 8 caracteres.</p>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Enlace inválido.{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            Solicita uno nuevo
          </Link>
          .
        </p>
      )}
    </>
  );
}
