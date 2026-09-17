import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div><Logo /><p>La forma rápida de encontrar y mover piezas usadas entre particulares.</p></div>
        <div><strong>Marketplace</strong><Link href="/marketplace">Buscar piezas</Link><Link href="/marketplace?type=vehicle">Coches en despiece</Link><Link href="/publicar">Publicar anuncio</Link></div>
        <div><strong>Importante</strong><p>DESGUÁZALO no procesa pagos ni envíos. Comprador y vendedor acuerdan la operación directamente.</p></div>
      </div>
    </footer>
  );
}
