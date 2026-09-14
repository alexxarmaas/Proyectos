import type { SVGProps } from "react";

type IconName =
  | "wrench" | "bolt" | "car" | "spark" | "mountain" | "bike"
  | "whatsapp" | "phone" | "pin" | "clock" | "arrow" | "catalog"
  | "menu" | "close" | "check" | "chevron";

export function UiIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    wrench: <><path d="M14.7 6.3a4.4 4.4 0 0 0-5.6 5.6L3 18l3 3 6.1-6.1a4.4 4.4 0 0 0 5.6-5.6l-2.6 2.6-3-3 2.6-2.6Z"/></>,
    bolt: <><path d="M13 2 5.5 13H11l-1 9 8.5-12H13l0-8Z"/></>,
    car: <><path d="m4 14 1.8-5.3A2.5 2.5 0 0 1 8.2 7h7.6a2.5 2.5 0 0 1 2.4 1.7L20 14"/><path d="M3 14h18v5H3z"/><path d="M6 19v2M18 19v2M7 16h.01M17 16h.01"/></>,
    spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z"/></>,
    mountain: <><path d="m3 19 6.5-10 3.2 4.4L15 10l6 9H3Z"/><path d="m7.7 11.7 1.8 1.6 1.8-1.3"/></>,
    bike: <><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="m7.8 14.6 3-6.1h3.4l2.3 6.1M10.8 8.5 8 8M12 12h4M14.2 8.5l1.2-2"/></>,
    whatsapp: <><path d="M20.5 11.8a8.3 8.3 0 0 1-12.2 7.3L4 20l.9-4.1A8.3 8.3 0 1 1 20.5 11.8Z"/><path d="M9.1 8.4c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 2c.1.3.1.5-.1.7l-.6.7c-.2.2-.3.4-.1.7.7 1.3 1.8 2.3 3.2 2.9.3.1.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l2 .9c.3.1.5.3.5.5 0 .3-.2 1.5-1.1 2.1-.8.6-1.9.8-3.1.4-1.1-.3-2.5-.8-4.3-2.4-1.5-1.4-2.6-3.1-2.9-4.3-.3-1.1 0-2.2.7-2.9Z"/></>,
    phone: <><path d="M6.6 3.5 9 7.8 7.3 9.5a15.3 15.3 0 0 0 7.2 7.2l1.7-1.7 4.3 2.4v2.2c0 .8-.6 1.4-1.4 1.4C10.2 21 3 13.8 3 4.9c0-.8.6-1.4 1.4-1.4h2.2Z"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    catalog: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M8 8h7M8 12h7M8 16h4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    chevron: <><path d="m9 6 6 6-6 6"/></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common} {...props}>{paths[name]}</svg>;
}
