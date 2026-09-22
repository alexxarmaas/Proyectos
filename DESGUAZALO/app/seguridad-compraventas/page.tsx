import Link from "next/link";

export default function SafetyPage() {
  return (
    <div className="shell legal-page">
      <div className="legal-head">
        <span className="kicker">TRATO DIRECTO</span>
        <h1>Seguridad en compraventas</h1>
        <p>DESGUÁZALO pone en contacto a las partes. Estas comprobaciones reducen errores y fraudes antes de cerrar una operación.</p>
      </div>

      <div className="safety-grid">
        <section><h2>Comprueba la referencia</h2><p>Prioriza la referencia OEM y compárala con tu pieza original. Marca, modelo y año por sí solos no garantizan compatibilidad.</p></section>
        <section><h2>Pide fotos concretas</h2><p>Solicita conectores, etiquetas, anclajes, desperfectos y cualquier zona que no aparezca claramente en el anuncio.</p></section>
        <section><h2>Confirma el estado</h2><p>Pregunta si la pieza se ha probado, de qué vehículo procede, kilometraje aproximado y si existe alguna condición especial de devolución o garantía.</p></section>
        <section><h2>Desconfía de la urgencia</h2><p>No envíes dinero porque alguien te presione, cambie repentinamente las condiciones o te pida salir de canales razonables de comunicación.</p></section>
        <section><h2>Entrega y pago</h2><p>Aclara por escrito precio final, portes, método de pago y quién asume cada coste antes de realizar la operación.</p></section>
        <section><h2>Reporta problemas</h2><p>Si un anuncio parece falso, engañoso o inseguro, utiliza la opción de reportar de la ficha para que pueda revisarse.</p></section>
      </div>

      <div className="safe-note">
        <strong>DESGUÁZALO no custodia pagos</strong>
        <p>La beta no ofrece escrow, pagos integrados ni protección de comprador propia. La operación se acuerda directamente entre comprador y vendedor.</p>
      </div>

      <p className="mt-6"><Link href="/marketplace" className="button button-primary">Volver al marketplace</Link></p>
    </div>
  );
}
