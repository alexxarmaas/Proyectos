import type { Metadata } from "next";
import Link from "next/link";
import { getPartRequests } from "@/lib/data";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Se busca", description: "Solicitudes de recambios que otros usuarios están buscando." };

export default async function WantedPage() {
  const rows = await getPartRequests();
  return <div className="shell account-page">
    <div className="account-head"><div><span className="kicker">DEMANDA REAL</span><h1>Se busca</h1><p className="muted">Piezas que otros usuarios todavía no han encontrado. Si la tienes, contacta directamente.</p></div><Link href="/solicitar" className="button button-primary">+ Pedir una pieza</Link></div>
    {rows.length ? <div className="request-grid">{rows.map((row) => {
      const whatsapp = row.requester?.whatsapp?.replace(/\D/g, "");
      const message = encodeURIComponent("Hola, he visto en DESGUÁZALO que buscas “" + row.title + "”. Creo que puedo ayudarte.");
      return <article className="request-card" key={row.id}><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><span className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--dg-accent-strong)]">Buscando · {relativeDate(row.created_at)}</span><h2 className="mt-1 text-2xl">{row.title}</h2><p className="mt-2 text-sm text-[var(--dg-muted)]">{[row.brand,row.model,row.generation,row.year,row.engine].filter(Boolean).join(" · ")}</p>{row.reference_code && <p className="mt-2 text-sm"><strong>OEM:</strong> {row.reference_code}</p>}{row.notes && <p className="mt-3 max-w-3xl text-sm leading-6">{row.notes}</p>}<p className="mt-3 text-sm text-[var(--dg-muted)]">{row.location} · {row.requester?.display_name || "Usuario"}</p></div><div className="flex gap-2">{whatsapp && <a className="button button-whatsapp" target="_blank" rel="noreferrer" href={"https://wa.me/" + whatsapp + "?text=" + message}>Tengo esta pieza</a>}{!whatsapp && row.requester?.phone && <a className="button button-dark" href={"tel:" + row.requester.phone}>Llamar</a>}</div></div></article>;
    })}</div> : <div className="empty-state"><h2>No hay solicitudes abiertas</h2><p>Cuando alguien no encuentre una pieza, aparecerá aquí.</p><Link href="/solicitar" className="button button-primary">Publicar solicitud</Link></div>}
  </div>;
}
