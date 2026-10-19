import { requireTeacher } from "@/lib/auth";
import { getStudents } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { StudentsManager } from "./students-manager";

export const metadata = { title: "Estudiantes" };

export default async function StudentsPage() {
  const teacher = await requireTeacher();
  const list = await getStudents(teacher.id);
  return (
    <>
      <PageHeader title="Estudiantes" subtitle="Lista única del aula. Se reutiliza en todos los módulos." />
      <StudentsManager students={list} />
    </>
  );
}
