import { Header } from "@/components/Header";
import { RequestBox } from "@/components/RequestBox";
import { Brand } from "@/components/Brand";
import { UiIcon } from "@/components/UiIcon";
import { categories, catalogs } from "@/data/site";

export default function Home() {
  return (
    <main>
      <Header />

      <section className="hero">
        <div className="heroGlow" />
        <div className="heroMark" aria-hidden="true">S</div>
        <div className="container heroGrid">
          <div className="heroCopy">
            <div className="eyebrow eyebrowBlue">AUTOREPUESTOS · ACCESORIOS · VECINDARIO</div>
            <h1>El repuesto correcto.<br /><span>A la primera.</span></h1>
            <p className="heroLead">Repuestos, accesorios y equipamiento para coche, moto, camper y 4x4. Envíanos tu matrícula y localizamos la referencia que necesitas.</p>
            <div className="heroButtons">
              <a href="#consulta" className="button buttonBlue">Buscar un repuesto <UiIcon name="arrow" /></a>
              <a href="#catalogos" className="button buttonOutline">Ver catálogos</a>
            </div>
            <div className="heroTrust">
              <div><strong>Vecindario</strong><span>Gran Canaria</span></div>
              <div><strong>Atención directa</strong><span>Sin intermediarios</span></div>
              <div><strong>Profesionales</strong><span>Talleres y empresas</span></div>
            </div>
          </div>
          <div id="consulta" className="requestWrap"><RequestBox /></div>
        </div>
      </section>

      <section className="marquee" aria-label="Especialidades">
        <div className="container marqueeInner"><span>COCHE</span><i>•</i><span>MOTO</span><i>•</i><span>CAMPER</span><i>•</i><span>4X4</span><i>•</i><span>TALLERES</span><i>•</i><span>ACCESORIOS</span></div>
      </section>

      <section className="processStrip">
        <div className="container processGrid">
          <div className="processIntro"><span className="eyebrow">MÁS RÁPIDO, MÁS SIMPLE</span><strong>De la matrícula al repuesto.</strong></div>
          <div className="processStep"><span>01</span><div><strong>Envíanos los datos</strong><small>Matrícula + pieza que buscas</small></div></div>
          <div className="processStep"><span>02</span><div><strong>Localizamos referencia</strong><small>Comprobamos compatibilidad</small></div></div>
          <div className="processStep"><span>03</span><div><strong>Te respondemos</strong><small>Disponibilidad y presupuesto</small></div></div>
        </div>
      </section>

      <section className="section" id="categorias">
        <div className="container">
          <div className="sectionHead">
            <div><span className="eyebrow eyebrowBlue">LO QUE TRABAJAMOS</span><h2>Todo lo que tu vehículo necesita.</h2></div>
            <p>Organizado para que encuentres rápido el tipo de producto y nos consultes la referencia exacta.</p>
          </div>
          <div className="categoryGrid">
            {categories.map((c, i) => (
              <article className="categoryCard" key={c.title}>
                <div className="categoryNumber">0{i + 1}</div>
                <div className="categoryIcon"><UiIcon name={c.icon} /></div>
                <h3>{c.title}</h3><p>{c.desc}</p>
                <a href="#consulta">Consultar <UiIcon name="arrow" /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="darkSection" id="catalogos">
        <div className="container">
          <div className="sectionHead inverse">
            <div><span className="eyebrow eyebrowBlue">CATÁLOGOS</span><h2>Explora. Encuentra. Pregúntanos.</h2></div>
            <p>Catálogos de proveedores y campañas disponibles desde una sola página, sin convertir la web en un ecommerce inmanejable.</p>
          </div>
          <div className="catalogGrid">
            {catalogs.map((c) => (
              <article className="catalogCard" key={c.title}>
                <div className="catalogVisual"><span>{c.tag}</span><div className="mechanicMark">S</div></div>
                <div className="catalogBody"><small>{c.meta}</small><h3>{c.title}</h3><div><span>{c.pages}</span><a href="#consulta">Consultar <UiIcon name="arrow" /></a></div></div>
              </article>
            ))}
          </div>
          <div className="catalogNote"><UiIcon name="catalog" /><div><strong>¿No ves lo que buscas?</strong><span>Los catálogos son solo una muestra. Escríbenos con tu matrícula y lo buscamos por ti.</span></div><a href="#consulta">Hacer consulta</a></div>
        </div>
      </section>

      <section className="section professional" id="profesionales">
        <div className="container proGrid">
          <div className="proCopy"><span className="eyebrow eyebrowBlue">SANTANA PRO</span><h2>Una atención pensada para talleres.</h2><p>Canal directo para profesionales, consultas de referencias, pedidos recurrentes y presupuestos. Menos tiempo buscando. Más tiempo trabajando.</p>
            <div className="proBenefits">
              <span><UiIcon name="check" /> Respuesta prioritaria</span><span><UiIcon name="check" /> Identificación por matrícula</span><span><UiIcon name="check" /> Pedidos recurrentes</span><span><UiIcon name="check" /> Atención comercial directa</span>
            </div>
            <a href="https://wa.me/34682583877?text=Hola%20Santana%20Autorepuestos.%20Soy%20profesional%20y%20quiero%20informaci%C3%B3n%20sobre%20el%20canal%20para%20talleres." target="_blank" rel="noreferrer" className="button buttonBlue">Soy profesional <UiIcon name="arrow" /></a>
          </div>
          <div className="proCard">
            <div className="proCardGlow" />
            <div className="proCardTop"><Brand /></div>
            <div className="proCardBody"><span>CANAL PROFESIONAL</span><strong>Talleres · Empresas · Flotas</strong><p>Una relación más rápida entre el mostrador y tu negocio.</p></div>
          </div>
        </div>
      </section>

      <section className="contactSection" id="contacto">
        <div className="container contactGrid">
          <div><span className="eyebrow eyebrowBlue">ESTAMOS EN VECINDARIO</span><h2>Ven, llámanos o escríbenos.</h2><p>Calle Adeje, 9 · 35110 Vecindario, Santa Lucía de Tirajana.</p><a className="directionsLink" href="https://www.google.com/maps/search/?api=1&query=Calle+Adeje+9+Vecindario+Gran+Canaria" target="_blank" rel="noreferrer"><UiIcon name="pin" /> Cómo llegar <UiIcon name="arrow" /></a></div>
          <div className="contactCards">
            <a href="tel:+34928285084"><span className="contactIcon"><UiIcon name="phone" /></span><span><small>Teléfono</small><strong>928 28 50 84</strong></span><UiIcon name="chevron" className="contactChevron" /></a>
            <a href="https://wa.me/34682583877" target="_blank" rel="noreferrer"><span className="contactIcon whatsappIcon"><UiIcon name="whatsapp" /></span><span><small>WhatsApp</small><strong>682 58 38 77</strong></span><UiIcon name="chevron" className="contactChevron" /></a>
            <div><span className="contactIcon"><UiIcon name="clock" /></span><span><small>Horario</small><strong>08:00 — 16:30</strong></span></div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footerGrid"><Brand /><p>Preview conceptual · Santana Autorepuestos y Accesorios · Vecindario</p><a href="/admin">Entrar al backoffice <UiIcon name="arrow" /></a></div>
      </footer>

      <div className="mobileBottomBar">
        <a href="tel:+34928285084"><UiIcon name="phone" /> Llamar</a>
        <a className="mobileBottomWhatsapp" href="https://wa.me/34682583877" target="_blank" rel="noreferrer"><UiIcon name="whatsapp" /> WhatsApp</a>
      </div>
    </main>
  );
}
