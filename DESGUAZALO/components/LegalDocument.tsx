import Link from "next/link";
import { legalIdentityComplete } from "@/lib/legal";

export function LegalDocument({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shell legal-page">
      <div className="legal-head">
        <span className="kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>

      {!legalIdentityComplete && (
        <div className="safe-note legal-warning">
          <strong>Datos del titular pendientes antes de apertura pública</strong>
          <p>Esta beta todavía no tiene completados todos los datos identificativos del responsable. No sustituirlos por datos ficticios.</p>
        </div>
      )}

      <article className="legal-document">{children}</article>

      <nav className="legal-related" aria-label="Información legal relacionada">
        <Link href="/legal/terminos">Términos y aviso legal</Link>
        <Link href="/legal/privacidad">Privacidad</Link>
        <Link href="/legal/cookies">Cookies y almacenamiento</Link>
        <Link href="/seguridad-compraventas">Seguridad en compraventas</Link>
      </nav>
    </div>
  );
}
