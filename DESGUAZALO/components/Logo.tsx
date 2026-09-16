import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="brand" aria-label="DESGUÁZALO, inicio">
      <span className="brand-mark" aria-hidden="true">D/</span>
      <span>DESGUÁZALO</span>
    </Link>
  );
}
