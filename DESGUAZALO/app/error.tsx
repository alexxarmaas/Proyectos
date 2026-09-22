"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("DESGUAZALO route error", error);
  }, [error]);

  return (
    <div className="shell account-page grid place-items-center py-16">
      <section className="dg-panel max-w-2xl p-8 text-center sm:p-12">
        <span className="kicker">ALGO NO HA SALIDO BIEN</span>
        <h1 className="mt-2 font-racing text-4xl font-black uppercase sm:text-5xl">No hemos podido cargar esta parte</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[var(--dg-muted)]">
          Tus datos no se han borrado. Puedes reintentar la operación o volver al marketplace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" className="button button-primary" onClick={reset}>Reintentar</button>
          <Link href="/marketplace" className="button button-ghost">Ir al marketplace</Link>
        </div>
        {error.digest && <p className="mt-5 text-xs text-[var(--dg-muted)]">Referencia del error: {error.digest}</p>}
      </section>
    </div>
  );
}
