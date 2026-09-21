import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Busca",
    text: "Entra al marketplace y filtra por pieza, marca, modelo, motor o referencia OEM.",
  },
  {
    number: "02",
    title: "Comprueba",
    text: "Revisa fotos, estado, coche de procedencia, ubicación y datos técnicos antes de escribir.",
  },
  {
    number: "03",
    title: "Habla",
    text: "Contacta directamente con el vendedor y acuerda pago, entrega o recogida sin intermediarios.",
  },
] as const;

const trustPoints = [
  ["Sin comisiones", "DESGUÁZALO no se queda un porcentaje por cada venta."],
  ["Trato directo", "Comprador y vendedor hablan entre ellos desde el primer momento."],
  ["Datos que sirven", "Marca, modelo, generación, motor, estado y referencia cuando exista."],
] as const;

export default function Home() {
  return (
    <div className="bg-[var(--dg-bg)] text-[var(--dg-ink)]">
      <section className="relative isolate overflow-hidden bg-[var(--dg-dark)] text-white">
        <div className="race-grid-bg absolute inset-0 -z-30 opacity-45" />
        <div className="absolute -right-28 -top-24 -z-20 h-[520px] w-[520px] rotate-12 border-[86px] border-[var(--dg-accent)]/[.045]" />
        <div className="absolute -left-20 bottom-[-150px] -z-20 h-72 w-[560px] -skew-x-12 bg-[var(--dg-warm)]/[.045]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:gap-20 lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--dg-accent)]/30 bg-[var(--dg-accent)]/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.16em] text-[var(--dg-accent-text)]">
              Marketplace de recambios usados
            </div>

            <h1 className="max-w-4xl text-[clamp(3.35rem,7vw,6.5rem)] font-black uppercase leading-[.9] tracking-[-0.055em] text-white">
              Encuentra la pieza.
              <br />
              <span className="text-[var(--dg-accent)]">Habla con quien la tiene.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
              DESGUÁZALO conecta a gente que busca recambios con gente que tiene piezas o coches para despiece. Sin checkout, sin comisiones y sin esconder el contacto detrás de la plataforma.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="dg-cta-safe inline-flex min-h-13 items-center justify-center bg-[var(--dg-accent)] px-6 text-sm font-black uppercase tracking-[.055em] text-[var(--dg-ink)] transition hover:bg-[var(--dg-accent-hover)]"
              >
                Entrar al marketplace
                <span className="ml-2 text-lg leading-none">→</span>
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex min-h-13 items-center justify-center border border-white/20 bg-white/[.035] px-6 text-sm font-extrabold uppercase tracking-[.045em] text-white transition hover:border-white/40 hover:bg-white/[.075]"
              >
                Ver cómo funciona
              </Link>
            </div>

            <div className="mt-9 grid max-w-2xl grid-cols-1 gap-3 border-t border-white/10 pt-6 text-sm sm:grid-cols-3">
              <div>
                <strong className="block text-white">Piezas sueltas</strong>
                <span className="mt-1 block text-zinc-500">Motor, faros, interior, electrónica…</span>
              </div>
              <div>
                <strong className="block text-white">Coches en despiece</strong>
                <span className="mt-1 block text-zinc-500">Vehículos completos como donantes.</span>
              </div>
              <div>
                <strong className="block text-white">Compra local</strong>
                <span className="mt-1 block text-zinc-500">Filtra por zona y habla directamente.</span>
              </div>
            </div>
          </div>

          <div className="race-cut border border-white/12 bg-[var(--dg-dark-soft)] p-6 shadow-[12px_12px_0_rgba(0,0,0,.22)] sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--dg-accent)]">Cómo se usa</p>
                <h2 className="mt-1 text-2xl font-black uppercase tracking-[-.03em] text-white">Tres pasos y fuera</h2>
              </div>
              <span className="font-racing text-4xl font-black italic text-white/10">D/</span>
            </div>

            <div className="divide-y divide-white/10">
              {steps.map((step) => (
                <div key={step.number} className="grid grid-cols-[48px_1fr] gap-4 py-5">
                  <span className="font-racing text-2xl font-black italic text-[var(--dg-accent)]">{step.number}</span>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[.05em] text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-zinc-400">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/marketplace" className="mt-2 inline-flex items-center text-sm font-black uppercase tracking-[.045em] text-white transition hover:text-[var(--dg-accent)]">
              Ver piezas disponibles <span className="ml-2 text-[var(--dg-warm)]">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-24 border-b border-zinc-300 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.18em] text-[var(--dg-accent-strong)]">Lo esencial</p>
              <h2 className="mt-3 max-w-lg text-4xl font-black uppercase leading-[.95] tracking-[-.045em] sm:text-5xl">No hace falta aprender otra app.</h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-zinc-600">
                Entras, buscas y contactas. La plataforma está pensada para reducir pasos, no para meterse en medio de la compraventa.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden border border-zinc-300 bg-zinc-300 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="min-h-64 bg-[var(--dg-bg)] p-6 sm:p-7">
                  <span className="font-racing text-4xl font-black italic text-zinc-300">{step.number}</span>
                  <h3 className="mt-10 text-2xl font-black uppercase tracking-[-.03em] text-[var(--dg-ink)]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-300 bg-[var(--dg-surface-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-9 max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-[var(--dg-accent-strong)]">Qué vas a encontrar</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-[.95] tracking-[-.045em] sm:text-5xl">Dos formas de encontrar lo que te falta.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Link href="/marketplace" className="group race-cut relative min-h-[330px] overflow-hidden bg-[var(--dg-ink)] p-7 text-white shadow-[8px_8px_0_var(--dg-accent)] transition hover:-translate-y-1 sm:p-9">
              <div className="absolute right-[-15px] top-[-45px] font-racing text-[11rem] font-black italic leading-none text-white/[.035]">01</div>
              <p className="relative text-[11px] font-black uppercase tracking-[.18em] text-[var(--dg-accent)]">Piezas individuales</p>
              <h3 className="relative mt-4 max-w-md text-4xl font-black uppercase leading-[.95] tracking-[-.04em] sm:text-5xl">Busca exactamente la pieza que necesitas.</h3>
              <p className="relative mt-5 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
                Desde un faro o una centralita hasta una caja de cambios. Filtra por coche, pieza, categoría, estado, precio o ubicación.
              </p>
              <span className="relative mt-8 inline-flex items-center text-sm font-black uppercase tracking-[.045em] text-white group-hover:text-[var(--dg-accent)]">Explorar piezas <span className="ml-2 text-[var(--dg-warm)]">→</span></span>
            </Link>

            <Link href="/marketplace?type=vehicle" className="group race-cut relative min-h-[330px] overflow-hidden border border-zinc-300 bg-white p-7 shadow-[8px_8px_0_#d1d4cc] transition hover:-translate-y-1 sm:p-9">
              <div className="absolute right-[-15px] top-[-45px] font-racing text-[11rem] font-black italic leading-none text-black/[.035]">02</div>
              <p className="relative text-[11px] font-black uppercase tracking-[.18em] text-[var(--dg-warm)]">Coches en despiece</p>
              <h3 className="relative mt-4 max-w-md text-4xl font-black uppercase leading-[.95] tracking-[-.04em] text-[var(--dg-ink)] sm:text-5xl">Encuentra un coche donante completo.</h3>
              <p className="relative mt-5 max-w-lg text-sm leading-7 text-zinc-600 sm:text-base">
                Si buscas varias piezas del mismo modelo, entra directamente a vehículos para despiece y pregunta al vendedor qué sigue disponible.
              </p>
              <span className="relative mt-8 inline-flex items-center text-sm font-black uppercase tracking-[.045em] text-[var(--dg-ink)] group-hover:text-[var(--dg-warm)]">Ver coches en despiece <span className="ml-2">→</span></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--dg-ink)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.18em] text-[var(--dg-accent)]">Por qué DESGUÁZALO</p>
              <h2 className="mt-3 max-w-lg text-4xl font-black uppercase leading-[.95] tracking-[-.045em] sm:text-5xl">Menos plataforma. Más compraventa.</h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">
                Queremos que la web ayude a encontrar la pieza correcta y a poner en contacto a las dos personas. El resto se decide fuera de la plataforma.
              </p>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {trustPoints.map(([title, text], index) => (
                <div key={title} className="grid gap-3 py-6 sm:grid-cols-[64px_180px_1fr] sm:items-start sm:gap-5">
                  <span className="font-racing text-2xl font-black italic text-[var(--dg-accent)]">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="text-base font-black uppercase tracking-[.035em] text-white">{title}</strong>
                  <p className="text-sm leading-6 text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-300 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="race-cut overflow-hidden bg-[var(--dg-accent)] p-7 shadow-[10px_10px_0_var(--dg-ink)] sm:p-10 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.18em] text-black/55">También para vender</p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[.92] tracking-[-.045em] text-[var(--dg-ink)] sm:text-6xl">¿Tienes piezas guardadas o un coche para despiece?</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-black/65">
                Sube unas fotos, indica el coche de procedencia, precio y zona. La idea es publicar rápido y que el interesado pueda encontrarte.
              </p>
            </div>
            <Link href="/publicar" className="dg-cta-safe mt-8 inline-flex min-h-13 items-center justify-center bg-[var(--dg-ink)] px-6 text-sm font-black uppercase tracking-[.055em] text-white transition hover:bg-[var(--dg-warm)] lg:mt-0">
              Publicar una pieza
              <span className="ml-2 text-lg">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--dg-bg)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 sm:py-20 md:flex-row md:items-end lg:px-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-[var(--dg-accent-strong)]">Listo para buscar</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black uppercase leading-[.95] tracking-[-.045em] sm:text-5xl">Ahora sí: entra al stock.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">Cuando ya sabes cómo funciona, el marketplace te lleva directo a las piezas, filtros y despieces disponibles.</p>
          </div>
          <Link href="/marketplace" className="dg-cta-safe inline-flex min-h-13 items-center justify-center bg-[var(--dg-ink)] px-7 text-sm font-black uppercase tracking-[.055em] text-white transition hover:bg-[var(--dg-warm)]">
            Ir al marketplace
            <span className="ml-2 text-lg">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
