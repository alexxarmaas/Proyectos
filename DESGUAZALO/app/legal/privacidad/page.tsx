import { LegalDocument } from "@/components/LegalDocument";
import { legalIdentity, legalUpdatedAt } from "@/lib/legal";

const value = (input: string, fallback: string) => input || fallback;

export default function PrivacyPage() {
  return (
    <LegalDocument
      kicker="PROTECCIÓN DE DATOS"
      title="Política de privacidad"
      intro="Qué datos utiliza DESGUÁZALO, para qué y qué control tienes sobre ellos."
    >
      <section>
        <h2>1. Responsable</h2>
        <p><strong>Responsable:</strong> {value(legalIdentity.name, "Titular de DESGUÁZALO — pendiente de completar")}</p>
        <p><strong>Contacto de privacidad:</strong> {value(legalIdentity.email, "Pendiente de completar antes de apertura pública")}</p>
      </section>

      <section>
        <h2>2. Datos tratados</h2>
        <p>Según las funciones que utilices, podemos tratar datos de cuenta y perfil, información de contacto, anuncios y fotografías, vehículos guardados en el garaje, favoritos, búsquedas guardadas, solicitudes de piezas, notificaciones, reportes, feedback de beta y eventos básicos de uso del producto.</p>
        <p>El feedback de beta puede incluir automáticamente la ruta visitada, navegador, tamaño de pantalla y fecha. Los eventos de producto pueden registrar acciones como búsquedas, apertura de anuncios, favoritos, contactos o publicaciones.</p>
      </section>

      <section>
        <h2>3. Finalidades</h2>
        <p>Usamos los datos para prestar el marketplace y sus funciones, autenticar cuentas, permitir el contacto entre usuarios, mostrar compatibilidades y alertas, prevenir abuso, atender incidencias y mejorar la experiencia durante la beta.</p>
        <p>No usamos los eventos de producto para publicidad comportamental ni para vender perfiles de usuarios.</p>
      </section>

      <section>
        <h2>4. Base jurídica</h2>
        <p>El tratamiento necesario para crear una cuenta, publicar, guardar información o usar las funciones solicitadas se vincula a la prestación del servicio. Determinados tratamientos de seguridad y mejora pueden apoyarse en intereses legítimos cuando resulte aplicable. Cuando una finalidad requiera consentimiento, se solicitará de forma específica.</p>
      </section>

      <section>
        <h2>5. Datos públicos</h2>
        <p>El nombre visible, ubicación general y los medios de contacto que añadas al perfil pueden mostrarse en tus anuncios para permitir el trato directo. El email de acceso no se publica.</p>
      </section>

      <section>
        <h2>6. Proveedores técnicos</h2>
        <p>DESGUÁZALO utiliza proveedores de infraestructura, alojamiento, base de datos, almacenamiento y autenticación para operar el servicio. Estos proveedores tratan datos de acuerdo con sus condiciones y acuerdos aplicables.</p>
      </section>

      <section>
        <h2>7. Conservación</h2>
        <p>Los datos se conservarán mientras sean necesarios para mantener la cuenta y prestar las funciones solicitadas, resolver incidencias, cumplir obligaciones legales o proteger el servicio. Durante la beta, los datos de feedback y analítica se revisarán periódicamente y se eliminarán cuando dejen de ser útiles para esas finalidades.</p>
      </section>

      <section>
        <h2>8. Tus derechos</h2>
        <p>Puedes solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad cuando corresponda. Para ejercerlos utiliza el contacto indicado en esta política. También puedes acudir a la autoridad de protección de datos competente.</p>
      </section>

      <section>
        <h2>9. Seguridad</h2>
        <p>Aplicamos controles de acceso, políticas RLS en base de datos y separación de permisos para limitar el acceso a la información. Ningún sistema es infalible, por lo que estas medidas se revisan durante la beta.</p>
      </section>

      <section>
        <h2>10. Actualizaciones</h2>
        <p><strong>Última actualización:</strong> {legalUpdatedAt}.</p>
      </section>
    </LegalDocument>
  );
}
