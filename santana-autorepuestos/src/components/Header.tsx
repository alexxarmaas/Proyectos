"use client";

import Link from "next/link";
import { useState } from "react";
import { Brand } from "./Brand";
import { UiIcon } from "./UiIcon";

const nav = [
  ["Repuestos", "#categorias"],
  ["Catálogos", "#catalogos"],
  ["Profesionales", "#profesionales"],
  ["Contacto", "#contacto"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="siteHeader">
      <div className="container headerInner">
        <Link href="/" aria-label="Inicio" onClick={() => setOpen(false)}><Brand compact /></Link>
        <nav className="desktopNav" aria-label="Navegación principal">
          {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="headerActions">
          <a className="linkGhost" href="tel:+34928285084"><UiIcon name="phone" /> 928 28 50 84</a>
          <Link className="button buttonSmall buttonBlue adminEntry" href="/admin">Gestión</Link>
          <button className="mobileMenuButton" type="button" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} onClick={() => setOpen(!open)}>
            <UiIcon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      <div className={`mobileMenu ${open ? "open" : ""}`}>
        <div className="container mobileMenuInner">
          {nav.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}<UiIcon name="chevron" /></a>)}
          <a href="https://wa.me/34682583877" target="_blank" rel="noreferrer" className="mobileWhatsapp"><UiIcon name="whatsapp" /> Escribir por WhatsApp</a>
          <Link href="/admin" onClick={() => setOpen(false)} className="mobileAdmin">Acceso gestión</Link>
        </div>
      </div>
    </header>
  );
}
