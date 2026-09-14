"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { requests } from "@/data/site";
import { Brand } from "./Brand";

const menu = ["Resumen", "Solicitudes", "Catálogos", "Categorías", "Banners", "Profesionales", "Reseñas", "Analítica", "Configuración"];

export function AdminClient() {
  const [active, setActive] = useState("Resumen");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => requests.filter((r) => `${r.id} ${r.plate} ${r.item}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <Link href="/"><Brand compact /></Link>
        <div className="adminTag">BACKOFFICE</div>
        <nav>
          {menu.map((item) => <button key={item} className={active === item ? "active" : ""} onClick={() => setActive(item)} title={item}><span>{navIcon(item)}</span><em>{item}</em></button>)}
        </nav>
        <div className="sidebarFooter">
          <span>Preview de gestión</span>
          <Link href="/">← Volver a la web</Link>
        </div>
      </aside>

      <main className="adminMain">
        <div className="adminTopbar">
          <div><span className="eyebrow">SANTANA / ADMIN</span><h1>{active}</h1></div>
          <div className="adminUser"><span className="onlineDot" /><div><strong>Administrador</strong><small>Acceso completo</small></div><div className="avatar">SA</div></div>
        </div>

        {active === "Resumen" ? (
          <>
            <section className="metricGrid">
              <Metric label="Solicitudes hoy" value="18" trend="+24%" />
              <Metric label="Pendientes" value="7" trend="Por atender" />
              <Metric label="WhatsApp" value="41" trend="Esta semana" />
              <Metric label="Reseñas Google" value="4,9" trend="27 reseñas" />
            </section>
            <section className="adminGrid">
              <div className="panel panelWide">
                <div className="panelHead"><div><span className="eyebrow">ENTRADAS RECIENTES</span><h2>Solicitudes de repuesto</h2></div><button onClick={() => setActive("Solicitudes")} className="textButton">Ver todas →</button></div>
                <RequestTable rows={requests.slice(0, 4)} />
              </div>
              <div className="panel">
                <span className="eyebrow">ACCESO RÁPIDO</span><h2>Publicar contenido</h2>
                <div className="quickList">
                  <button onClick={() => setActive("Catálogos")}>＋ Nuevo catálogo <span>PDF</span></button>
                  <button onClick={() => setActive("Banners")}>＋ Nuevo banner <span>HOME</span></button>
                  <button onClick={() => setActive("Categorías")}>＋ Nueva categoría <span>WEB</span></button>
                </div>
              </div>
            </section>
            <section className="adminGrid lower">
              <div className="panel panelWide chartPanel"><span className="eyebrow">ÚLTIMOS 7 DÍAS</span><h2>Consultas recibidas</h2><div className="bars">{[42,62,48,78,58,88,68].map((h,i)=><div key={i}><span style={{height:`${h}%`}} /><small>{["L","M","X","J","V","S","D"][i]}</small></div>)}</div></div>
              <div className="panel"><span className="eyebrow">WEB</span><h2>Estado de contenido</h2><div className="contentStatus"><p><span>Catálogos publicados</span><strong>6</strong></p><p><span>Categorías activas</span><strong>8</strong></p><p><span>Banners activos</span><strong>3</strong></p><p><span>Última edición</span><strong>Hoy</strong></p></div></div>
            </section>
          </>
        ) : active === "Solicitudes" ? (
          <section className="panel adminSingle"><div className="panelHead"><div><span className="eyebrow">GESTIÓN COMERCIAL</span><h2>Solicitudes</h2></div><input className="adminSearch" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar matrícula, pieza…" /></div><RequestTable rows={filtered} /></section>
        ) : (
          <ModulePreview title={active} />
        )}
      </main>
    </div>
  );
}

function Metric({label,value,trend}:{label:string;value:string;trend:string}) { return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{trend}</small></div> }
function RequestTable({rows}:{rows:typeof requests}) { return <div className="tableWrap"><table><thead><tr><th>ID</th><th>Matrícula</th><th>Solicitud</th><th>Canal</th><th>Estado</th><th>Hora</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td data-label="ID">{r.id}</td><td data-label="Matrícula"><b className="plate">{r.plate}</b></td><td data-label="Solicitud">{r.item}</td><td data-label="Canal">{r.channel}</td><td data-label="Estado"><span className={`status status-${r.status.toLowerCase()}`}>{r.status}</span></td><td data-label="Hora">{r.time}</td></tr>)}</tbody></table></div> }
function ModulePreview({title}:{title:string}) { return <section className="panel adminSingle emptyModule"><div className="moduleIcon">{navIcon(title)}</div><span className="eyebrow">MÓDULO DE GESTIÓN</span><h2>{title}</h2><p>Esta pantalla representa el módulo que permitirá administrar {title.toLowerCase()} desde el backoffice. En producción se conectará a la base de datos y almacenamiento.</p><div className="moduleActions"><button className="button buttonBlue">＋ Crear nuevo</button><button className="button buttonOutline">Importar / gestionar</button></div></section> }
function navIcon(item:string){ const m:Record<string,string>={"Resumen":"⌂","Solicitudes":"◫","Catálogos":"▤","Categorías":"⌘","Banners":"▰","Profesionales":"◇","Reseñas":"★","Analítica":"⌁","Configuración":"⚙"}; return m[item] || "•"; }
