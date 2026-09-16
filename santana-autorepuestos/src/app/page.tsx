import { Header } from "@/components/Header";
import { RequestBox } from "@/components/RequestBox";
import { Brand } from "@/components/Brand";
import { UiIcon } from "@/components/UiIcon";
import { categories, catalogs, featuredBrands, reviews } from "@/data/site";

export default function Home() {
  return (
    <main>
      <Header />

      <section className="hero">
        <div className="heroNoise" />
        <div className="heroGlow" />
        <div className="heroMark" aria-hidden="true">S</div>
        <div className="container heroGrid">
          <div className="heroCopy">
            <div className="eyebrow eyebrowBlue">AUTOREPUESTOS · ACCESORIOS · VECINDARIO</div>
            <div className="heroBadgeRow">
              <span>Consulta por matrícula</span>
              <span>WhatsApp directo</span>
              <span>Canal profesional</span>
            </div>
            <h1>Tu repuesto, <br /><span>sin perder tiempo.</span></h1>
            <p className="heroLead">Piezas, accesorios y equipamiento para coche, moto, camper y 4x4. Nos mandas la matrícula, nos dices qué buscas y te respondemos con una solución real.</p>
            <div className="heroButtons">
              <a href="#consulta" className="button buttonBlue">Enviar matrícula <UiIcon name="arrow" /></a>
              <a href="#catalogos" className="button buttonOutline">Ver catálogos</a>
            </div>
            <div className="heroFeaturePills">
              <span><UiIcon name="check" /> Atención rápida</span>
              <span><UiIcon name="check" /> Piezas y accesorios</span>
              <span><UiIcon name="check" /> Vecindario · Gran Canaria</span>
            </div>
            <div className="heroTrust">
              <div><strong>5,0 ★ · 27 reseñas</strong><span>Valoración en Google</span></div>
              <div><strong>Coche · Moto · Camper</strong><span>Más líneas, una sola atención</span></div>
              <div><strong>Talleres y empresas</strong><span>Canal profesional directo</span></div>
            </div>
          </div>

          <div className="heroAside">
            <div className="heroShowcaseCard">
              <div className="heroShowcaseTop">
                <Brand compact />
                <div className="heroCallout">
                  <strong>Respuesta rápida</strong>
                  <span>Mostrador + WhatsApp</span>
                </div>
              </div>
              <div className="heroMiniSteps">
                <div><span>01</span><p>Nos envías matrícula o referencia</p></div>
                <div><span>02</span><p>Buscamos la pieza y comprobamos compatibilidad</p></div>
                <div><span>03</span><p>Te respondemos con disponibilidad y presupuesto</p></div>
              </div>
              <div id="consulta" className="requestWrap"><RequestBox /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="brandStrip">
        <div className="container brandStripInner">
          <div className="stripIntro">
            <span className="eyebrow">LÍNEAS Y REFERENCIAS</span>
            <strong>Encuentra rápido la familia de producto que necesitas.</strong>
          </div>
          <div className="brandLogos" aria-label="Líneas destacadas">
            {featuredBrands.map((brand) => <span key={brand}>{brand}</span>)}
          </div>
        </div>
      </section>

      <section className="processStrip">
        <div className="container processGrid">
          <div className="processIntro"><span className="eyebrow">MÁS RÁPIDO, MÁS SIMPLE</span><strong>De la matrícula al repuesto.</strong></div>
          <div className="processStep"><span>01</span><div><strong>Envíanos los datos</strong><small>Matrícula + pieza que buscas</small></div></div>
          <div className="processStep"><span>02</span><div><strong>Localizamos referencia</strong><small>Comprobamos compatibilidad</small></div></div>
          <div className="processStep"><span>03</span><div><strong>Te respondemos</strong><small>Disponibilidad y presupuesto</small></div></div>
        </div>
      </section>

      <section className="section sectionLayered" id="categorias">
        <div className="container">
          <div className="sectionHead">
            <div><span className="eyebrow eyebrowBlue">LO QUE TRABAJAMOS</span><h2>Un mostrador preparado para mucho más que una sola pieza.</h2></div>
            <p>Desde mantenimiento rápido hasta accesorios y equipamiento específico para coche, moto, camper y 4x4.</p>
          </div>

          <div className="categoryLeadCard">
            <div>
              <span className="eyebrow eyebrowBlue">DESTACADO</span>
              <h3>Consulta por matrícula, referencia o necesidad.</h3>
              <p>No hace falta perderte en un ecommerce. Aquí vienes, preguntas y te ayudamos a dar con la pieza correcta sin vueltas innecesarias.</p>
            </div>
            <div className="categoryLeadStats">
              <span><strong>6</strong><small>Líneas destacadas</small></span>
              <span><strong>Directo</strong><small>Mostrador + WhatsApp</small></span>
              <span><strong>Pro</strong><small>Talleres y empresas</small></span>
            </div>
          </div>

          <div className="categoryGrid">
            {categories.map((c, i) => (
              <article className="categoryCard" key={c.title}>
                <div className="categoryNumber">0{i + 1}</div>
                <div className="categoryIcon"><UiIcon name={c.icon} /></div>
                <h3>{c.title}</h3><p>{c.desc}</p>
                <a href="#consulta">Consultar ahora <UiIcon name="arrow" /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="darkSection" id="catalogos">
        <div className="container">
          <div className="sectionHead inverse">
            <div><span className="eyebrow eyebrowBlue">CATÁLOGOS</span><h2>Explora campañas y líneas activas sin perder la atención humana.</h2></div>
            <p>Consulta campañas, líneas de producto y catálogos desde una sola página y pregúntanos directamente por cualquier referencia.</p>
          </div>
          <div className="catalogGrid">
            {catalogs.map((c) => (
              <article className="catalogCard" key={c.title}>
                <div className="catalogVisual"><span>{c.tag}</span><div className="mechanicMark">S</div></div>
                <div className="catalogBody"><small>{c.meta}</small><h3>{c.title}</h3><div><span>{c.pages}</span><a href="#consulta">Consultar <UiIcon name="arrow" /></a></div></div>
              </article>
            ))}
          </div>
          <div className="catalogNote"><UiIcon name="catalog" /><div><strong>¿No ves lo que buscas?</strong><span>Los catálogos son una muestra. Escríbenos con tu matrícula, una referencia o una foto y lo buscamos por ti.</span></div><a href="#consulta">Hacer consulta</a></div>
        </div>
      </section>

      <section className="section reviewSection">
        <div className="container">
          <div className="sectionHead">
            <div><span className="eyebrow eyebrowBlue">CONFIANZA LOCAL</span><h2>Una atención cercana que empieza antes de entrar por la puerta.</h2></div>
            <p>Información clara, contacto directo y una ficha local con una valoración excelente para que sepas con quién estás hablando.</p>
          </div>
          <div className="reviewGrid">
            {reviews.map((review, index) => (
              <article className="reviewCard" key={review.name + index}>
                <div className="reviewStars">★★★★★</div>
                <p>{review.quote}</p>
                <div className="reviewMeta">
                  <strong>{review.name}</strong>
                  <span>{review.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section professional" id="profesionales">
        <div className="container proGrid">
          <div className="proCopy"><span className="eyebrow eyebrowBlue">SANTANA PRO</span><h2>Una atención pensada para talleres y profesionales.</h2><p>Canal directo para profesionales, consultas de referencias, pedidos recurrentes y presupuestos. Menos tiempo buscando. Más tiempo facturando y trabajando.</p>
            <div className="proBenefits">
              <span><UiIcon name="check" /> Respuesta prioritaria</span><span><UiIcon name="check" /> Identificación por matrícula</span><span><UiIcon name="check" /> Pedidos recurrentes</span><span><UiIcon name="check" /> Atención comercial directa</span>
            </div>
            <a href="https://wa.me/34682583877?text=Hola%20Santana%20Autorepuestos.%20Soy%20profesional%20y%20quiero%20informaci%C3%B3n%20sobre%20el%20canal%20para%20talleres." target="_blank" rel="noreferrer" className="button buttonBlue">Hablar con Santana Pro <UiIcon name="arrow" /></a>
          </div>
          <div className="proCard">
            <div className="proCardGlow" />
            <div className="proCardTop"><Brand /></div>
            <div className="proCardBody"><span>CANAL PROFESIONAL</span><strong>Talleres · Empresas · Flotas</strong><p>Una relación más rápida entre el mostrador y tu negocio, con atención directa para referencias y pedidos recurrentes.</p></div>
            <div className="proBadgeRow"><span>PRIORIDAD</span><span>REFERENCIAS</span><span>PEDIDOS</span></div>
          </div>
        </div>
      </section>

      <section className="contactSection" id="contacto">
        <div className="container contactGrid">
          <div>
            <span className="eyebrow eyebrowBlue">ESTAMOS EN VECINDARIO</span>
            <h2>Ven, llámanos o escríbenos y arranca la consulta.</h2>
            <p>Calle Adeje, 9 · 35110 Vecindario, Santa Lucía de Tirajana. Estamos a un mensaje o una llamada de ayudarte con tu próxima pieza.</p>
            <a className="directionsLink" href="https://www.google.com/maps/search/?api=1&query=Calle+Adeje+9+Vecindario+Gran+Canaria" target="_blank" rel="noreferrer"><UiIcon name="pin" /> Cómo llegar <UiIcon name="arrow" /></a>
          </div>
          <div className="contactCards">
            <a href="tel:+34928285084"><span className="contactIcon"><UiIcon name="phone" /></span><span><small>Teléfono</small><strong>928 28 50 84</strong></span><UiIcon name="chevron" className="contactChevron" /></a>
            <a href="https://wa.me/34682583877" target="_blank" rel="noreferrer"><span className="contactIcon whatsappIcon"><UiIcon name="whatsapp" /></span><span><small>WhatsApp</small><strong>682 58 38 77</strong></span><UiIcon name="chevron" className="contactChevron" /></a>
            <div><span className="contactIcon"><UiIcon name="clock" /></span><span><small>Horario</small><strong>Lunes a viernes · 08:00 — 16:30</strong></span></div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footerGrid">
          <Brand />
          <p>Santana Autorepuestos y Accesorios · Vecindario · Gran Canaria</p>
          <a href="/admin">Entrar al backoffice <UiIcon name="arrow" /></a>
        </div>
      </footer>

      <div className="mobileBottomBar">
        <a href="tel:+34928285084"><UiIcon name="phone" /> Llamar</a>
        <a className="mobileBottomWhatsapp" href="https://wa.me/34682583877" target="_blank" rel="noreferrer"><UiIcon name="whatsapp" /> WhatsApp</a>
      </div>
    </main>
  );
}
