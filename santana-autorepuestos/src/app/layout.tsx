import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./vive.css";

export const metadata: Metadata = {
  title: {
    default: "Santana Autorepuestos y Accesorios | Vecindario",
    template: "%s | Santana Autorepuestos"
  },
  description: "Repuestos y accesorios para coche, moto, camper y 4x4 en Vecindario, Gran Canaria. Consulta por matrícula y WhatsApp.",
  applicationName: "Santana Autorepuestos",
  keywords: ["autorepuestos", "repuestos", "Vecindario", "Gran Canaria", "accesorios coche", "camper", "4x4", "moto"],
  robots: { index: false, follow: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101414"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
