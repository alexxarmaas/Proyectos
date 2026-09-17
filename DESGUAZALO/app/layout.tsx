import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import "./brand.css";
import "./modern.css";
import "./racing.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const racing = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-racing",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "DESGUÁZALO — Recambios usados y coches en despiece", template: "%s | DESGUÁZALO" },
  description: "Marketplace de recambios usados y vehículos para despiece. Busca por marca, modelo o pieza y contacta directamente con el vendedor.",
  openGraph: {
    title: "DESGUÁZALO",
    description: "Encuentra el recambio exacto para tu coche.",
    type: "website",
    locale: "es_ES"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${racing.variable}`}>
      <body className="min-h-screen bg-[#f0efe9] text-[#181b19] antialiased">
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
