import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "DESGUÁZALO — Piezas usadas, sin vueltas", template: "%s | DESGUÁZALO" },
  description: "Marketplace de piezas de coche usadas y vehículos para despiece. Encuentra la pieza, habla con el vendedor y cierra el trato directamente.",
  openGraph: {
    title: "DESGUÁZALO",
    description: "Encuentra esa pieza que necesitas.",
    type: "website",
    locale: "es_ES"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
