import { requireTeacher } from "@/lib/auth";
import { getProfile } from "@/lib/queries";
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const teacher = await requireTeacher();
  const profile = await getProfile(teacher.id);
  return (
    <div className="min-h-screen">
      <Sidebar name={`${teacher.nombre} ${teacher.apellido}`} plantel={profile?.plantel ?? ""} />
      <main className="print-area px-4 py-6 lg:ml-64 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
