import { LegalDocument } from "@/components/LegalDocument";
import { legalIdentity, legalUpdatedAt } from "@/lib/legal";

const value = (input: string, fallback: string) => input || fallback;

export default function TermsPage() {
  return (
    <LegalDocument
      kicker="INFORMACIÓN LEGAL"
      title="Términos de uso y aviso legal"
      intro="Condiciones básicas de acceso y uso de DESGUÁZALO durante su fase beta."
    >
      <section>
        <h2>1. Titular del servicio</h2>
        <p><strong>Titular:</strong> {value(legalIdentity.name, "Pendiente de completar")}</p>
        <p><strong>NIF:</strong> {value(legalIdentity.nif, "Pendiente de completar")}</p>
        <p><strong>Domicilio:</strong> {value(legalIdentity.address, "Pendiente de completar")}</p>
        <p><strong>Contacto:</strong> {value(legalIdentity.email, "Pendiente de completar")}</p>
      </section>

      <section>
        <h2>2. Qué es DESGUÁZALO</h2>
        <p>DESGUÁZALO es una plataforma de anuncios de piezas usadas y vehículos para despiece. La plataforma facilita que compradores y vendedores se encuentren y contacten directamente.</p>
        <p>DESGUÁZALO no actúa como vendedor de las piezas anunciadas, no cobra el precio de la compraventa, no custodia fondos y no organiza el transporte salvo que una funcionalidad futura indique expresamente lo contrario.</p>
      </section>

      <section>
        <h2>3. Fase beta</h2>
        <p>El servicio se encuentra en fase beta. Algunas funciones pueden cambiar, contener errores o no estar disponibles temporalmente. Los anuncios marcados como <strong>DEMO</strong> son ejemplos y no corresponden a ofertas reales.</p>
      </section>

      <section>
        <h2>4. Publicación de anuncios</h2>
        <p>Quien publica un anuncio debe tener derecho a ofrecer la pieza o vehículo, describirlo de forma veraz y mantener actualizado su estado. No se permite publicar contenido ilícito, engañoso, robado, falsificado o que infrinja derechos de terceros.</p>
        <p>DESGUÁZALO puede ocultar o retirar anuncios cuando existan indicios razonables de fraude, incumplimiento de estas condiciones o riesgo para otros usuarios.</p>
      </section>

      <section>
        <h2>5. Compatibilidad y referencias</h2>
        <p>La información sobre compatibilidad, referencias OEM, motorizaciones y años es orientativa. Antes de cerrar una operación, comprador y vendedor deben confirmar referencia, estado, conectores, versión y cualquier otro dato relevante.</p>
      </section>

      <section>
        <h2>6. Trato directo y responsabilidad</h2>
        <p>El acuerdo de compraventa se realiza directamente entre las partes. Cada usuario es responsable de verificar la identidad de la otra parte, el estado del artículo, las condiciones de pago, entrega y cualquier garantía que legalmente corresponda.</p>
        <p>Estas condiciones no limitan derechos que resulten irrenunciables conforme a la normativa aplicable.</p>
      </section>

      <section>
        <h2>7. Cuenta y seguridad</h2>
        <p>El usuario debe proteger sus credenciales y comunicar cualquier uso no autorizado de su cuenta. DESGUÁZALO puede limitar temporalmente accesos o acciones cuando sea necesario para proteger el servicio o investigar abuso.</p>
      </section>

      <section>
        <h2>8. Cambios</h2>
        <p>Durante la beta estas condiciones pueden actualizarse para reflejar cambios funcionales o legales. La versión publicada en esta página será la vigente.</p>
        <p><strong>Última actualización:</strong> {legalUpdatedAt}.</p>
      </section>
    </LegalDocument>
  );
}
