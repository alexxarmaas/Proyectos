import Link from "next/link";

const tabs = [
  ["anuncios", "/cuenta/anuncios", "Anuncios"],
  ["favoritos", "/cuenta/favoritos", "Favoritos"],
  ["garaje", "/cuenta/garaje", "Mi garaje"],
  ["busquedas", "/cuenta/busquedas", "Alertas"],
  ["solicitudes", "/cuenta/solicitudes", "Solicitudes"],
  ["pro", "/pro", "Profesional"],
  ["perfil", "/cuenta/perfil", "Perfil"],
] as const;

export function AccountTabs({ active }: { active: string }) {
  return <nav className="account-subnav" aria-label="Mi cuenta">{tabs.map(([key,href,label]) => <Link key={key} href={href} className={active===key?"active":""}>{label}</Link>)}</nav>;
}
