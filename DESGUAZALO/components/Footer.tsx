import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div><Logo /><p>Marketplace entre particulares para piezas usadas y coches en despiece.</p></div>
        <div><strong>Buscar</strong><Link href="/marketplace">Piezas</Link><Link href="/marketplace?type=vehicle">Coches en despiece</Link><Link href="/publicar">Publicar anuncio</Link></div>
        <div><strong>Cómo funciona</strong><p>El contacto, el pago y la entrega se acuerdan directamente entre comprador y vendedor.</p></div>
      </div>
    </footer>
  );
}
