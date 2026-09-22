import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="shell legal-page">
      <div className="legal-head">
        <span className="kicker">DESGUÁZALO EN 30 SEGUNDOS</span>
        <h1>Cómo funciona</h1>
        <p>Encuentra una pieza, comprueba que encaja y habla directamente con quien la tiene.</p>
      </div>

      <div className="how-grid">
        <section><span>01</span><h2>Busca</h2><p>Escribe pieza, coche o referencia OEM. También puedes filtrar por marca, modelo, generación, motor, ubicación y precio.</p><Link href="/marketplace">Ir al marketplace →</Link></section>
        <section><span>02</span><h2>Comprueba</h2><p>Revisa fotos, estado, referencia OEM y compatibilidades declaradas. Si tienes dudas, confirma la referencia antes de comprar.</p></section>
        <section><span>03</span><h2>Contacta</h2><p>Habla directamente con el vendedor por WhatsApp o teléfono. DESGUÁZALO no procesa el pago ni la entrega.</p></section>
        <section><span>04</span><h2>No la encuentras</h2><p>Publica una solicitud en “Se busca”. El sistema intentará encontrar coincidencias cuando aparezcan anuncios compatibles.</p><Link href="/solicitar">Publicar lo que busco →</Link></section>
      </div>

      <div className="safe-note">
        <strong>¿Vas a vender?</strong>
        <p>Puedes publicar una pieza individual o un vehículo completo para despiece. Los vendedores con mucho stock pueden activar las herramientas Pro de inventario y CSV.</p>
      </div>
    </div>
  );
}
