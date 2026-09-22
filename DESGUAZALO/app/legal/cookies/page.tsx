import { LegalDocument } from "@/components/LegalDocument";
import { legalUpdatedAt } from "@/lib/legal";

export default function CookiesPage() {
  return (
    <LegalDocument
      kicker="ALMACENAMIENTO Y COOKIES"
      title="Cookies y tecnologías similares"
      intro="Qué mecanismos técnicos utiliza actualmente DESGUÁZALO durante la beta."
    >
      <section>
        <h2>1. Estado actual</h2>
        <p>DESGUÁZALO no integra en esta beta cookies publicitarias ni herramientas de analítica de terceros destinadas a crear perfiles publicitarios.</p>
      </section>

      <section>
        <h2>2. Sesión y funcionamiento técnico</h2>
        <p>La autenticación y otras funciones técnicas pueden utilizar almacenamiento del navegador o mecanismos equivalentes necesarios para mantener la sesión, proteger el acceso y recordar determinadas preferencias funcionales.</p>
        <p>Por ejemplo, el navegador puede recordar datos de publicación reutilizables para evitar repetir campos en anuncios posteriores.</p>
      </section>

      <section>
        <h2>3. Analítica de producto</h2>
        <p>Durante la beta registramos en nuestros sistemas eventos básicos como búsquedas, apertura de anuncios, favoritos, contacto con vendedor, publicaciones o importaciones de inventario. Esta medición es first-party y no añade una cookie analítica independiente ni un identificador publicitario persistente.</p>
      </section>

      <section>
        <h2>4. Cambios futuros</h2>
        <p>Si en el futuro incorporamos cookies o tecnologías no estrictamente necesarias que requieran consentimiento, se mostrará el mecanismo de información y elección correspondiente antes de utilizarlas.</p>
      </section>

      <section>
        <h2>5. Actualizaciones</h2>
        <p><strong>Última actualización:</strong> {legalUpdatedAt}.</p>
      </section>
    </LegalDocument>
  );
}
