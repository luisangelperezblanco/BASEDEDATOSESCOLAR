import { requireTeacher } from "@/lib/auth";
import { getProfile } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Configuración" };

export default async function ConfigPage() {
  const teacher = await requireTeacher();
  const profile = await getProfile(teacher.id);
  return (
    <>
      <PageHeader title="Configuración" subtitle="Datos del docente y del plantel que aparecen en los reportes." />
      <ProfileForm
        initial={{
          nombre: teacher.nombre,
          apellido: teacher.apellido,
          email: teacher.email,
          plantel: profile?.plantel ?? "",
          grado: profile?.grado ?? "",
          seccion: profile?.seccion ?? "",
          anoEscolar: profile?.anoEscolar ?? "",
          dependencia: profile?.dependencia ?? "",
          localidad: profile?.localidad ?? "",
        }}
      />
    </>
  );
}
