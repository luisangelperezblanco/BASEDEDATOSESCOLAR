import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Sonya · Gestión Escolar", template: "%s · Sonya" },
  description: "Sistema web de gestión escolar y control docente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={sans.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
